const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("./models/User");
const House = require("./models/House");
const Floor = require("./models/Floor");
const Room = require("./models/Room");

/**
 * Migration script to convert from old structure to new House → Floor → Room structure
 * 
 * This script:
 * 1. Updates all users to have dynamic roles instead of fixed accountType
 * 2. Creates House documents from existing rooms
 * 3. Creates Floor documents for each unique floor in houses
 * 4. Updates Room documents to reference House and Floor
 */

async function migrate() {
  try {
    console.log("🚀 Starting migration...");
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to database");

    // Step 1: Update all existing users to new role system
    console.log("\n📝 Step 1: Updating user role system...");
    
    const usersToUpdate = await User.find({ 
      accountType: { $in: ["Landlord", "Renter"] } 
    });
    
    for (const user of usersToUpdate) {
      await User.findByIdAndUpdate(user._id, {
        accountType: "User",
        $set: {
          roles: {
            isLandlord: false,
            isRenter: false,
          },
        },
      });
    }
    
    console.log(`✅ Updated ${usersToUpdate.length} users to new role system`);

    // Step 2: Find all landlords who have rooms
    console.log("\n📝 Step 2: Processing landlords and their properties...");
    
    const landlords = await Room.distinct("landlord");
    console.log(`Found ${landlords.length} landlords with properties`);

    let totalHouses = 0;
    let totalFloors = 0;
    let totalRoomsUpdated = 0;

    for (const landlordId of landlords) {
      console.log(`\n👤 Processing landlord: ${landlordId}`);
      
      const rooms = await Room.find({ landlord: landlordId });
      
      if (rooms.length === 0) {
        console.log("  ⚠️ No rooms found, skipping...");
        continue;
      }

      // Group rooms by houseName (or create default house if no houseName)
      const groupedRooms = rooms.reduce((acc, room) => {
        const houseName = room.houseName || "My Property";
        if (!acc[houseName]) {
          acc[houseName] = [];
        }
        acc[houseName].push(room);
        return acc;
      }, {});

      console.log(`  📦 Found ${Object.keys(groupedRooms).length} house(s)`);

      // Process each house
      for (const [houseName, houseRooms] of Object.entries(groupedRooms)) {
        console.log(`\n  🏠 Creating house: "${houseName}"`);
        
        // Get address from first room or use default
        const firstRoom = houseRooms[0];
        const address = firstRoom.address || {
          city: "Unknown",
          state: "Unknown",
          pincode: "000000",
        };

        // Create house
        const house = await House.create({
          name: houseName,
          landlord: landlordId,
          address: address,
          totalUnits: houseRooms.length,
          occupiedUnits: houseRooms.filter((r) => r.status === "Occupied").length,
        });

        totalHouses++;
        console.log(`  ✅ House created: ${house._id}`);

        // Update user to be landlord
        await User.findByIdAndUpdate(landlordId, {
          "roles.isLandlord": true,
        });

        // Group rooms by floor number
        const floorGroups = houseRooms.reduce((acc, room) => {
          const floorNo = room.floorNo !== undefined ? room.floorNo : 0;
          if (!acc[floorNo]) {
            acc[floorNo] = [];
          }
          acc[floorNo].push(room);
          return acc;
        }, {});

        console.log(`  📊 Found ${Object.keys(floorGroups).length} floor(s)`);

        // Process each floor
        for (const [floorNo, floorRooms] of Object.entries(floorGroups)) {
          const floorNumber = parseInt(floorNo);
          const floorName = floorNumber === 0 
            ? "Ground Floor" 
            : floorNumber === 1 
            ? "First Floor" 
            : floorNumber === 2 
            ? "Second Floor" 
            : `Floor ${floorNumber}`;

          console.log(`    📁 Creating floor: ${floorName} (${floorNumber})`);

          // Create floor
          const floor = await Floor.create({
            house: house._id,
            floorNumber: floorNumber,
            floorName: floorName,
            totalUnits: floorRooms.length,
            occupiedUnits: floorRooms.filter((r) => r.status === "Occupied").length,
          });

          totalFloors++;
          console.log(`    ✅ Floor created: ${floor._id}`);

          // Update all rooms on this floor
          for (const room of floorRooms) {
            await Room.findByIdAndUpdate(room._id, {
              $set: {
                house: house._id,
                floor: floor._id,
              },
              $unset: {
                houseName: "",
                floorNo: "",
                address: "",
              },
            });

            totalRoomsUpdated++;

            // If room has a renter, update renter role
            if (room.renter) {
              await User.findByIdAndUpdate(room.renter, {
                "roles.isRenter": true,
              });
            }
          }

          console.log(`    ✅ Updated ${floorRooms.length} room(s) on this floor`);
        }

        // Update house total floors count
        await House.findByIdAndUpdate(house._id, {
          totalFloors: Object.keys(floorGroups).length,
        });
      }

      console.log(`  ✅ Completed processing for landlord ${landlordId}`);
    }

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Migration completed successfully!");
    console.log("=".repeat(50));
    console.log(`📊 Summary:`);
    console.log(`  - Houses created: ${totalHouses}`);
    console.log(`  - Floors created: ${totalFloors}`);
    console.log(`  - Rooms updated: ${totalRoomsUpdated}`);
    console.log(`  - Users updated: ${usersToUpdate.length}`);
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run migration
if (require.main === module) {
  migrate();
}

module.exports = migrate;
