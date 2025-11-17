# Roomly Multi-House Management System - Migration Guide

## 🎉 New Features Overview

The system has been completely restructured to support a more flexible and realistic property management model:

### Key Changes:

1. **House → Floor → Room Hierarchy**
   - Landlords can now manage multiple houses
   - Each house can have multiple floors
   - Each floor can have multiple rooms/flats/shops

2. **Dynamic User Roles**
   - No more fixed "Landlord" or "Renter" roles during signup
   - Users become landlords when they add a house
   - Users become renters when allocated to a room
   - Same user can be both landlord AND renter simultaneously

3. **Improved Data Structure**
   - Better organization and grouping
   - Address stored at house level (not individual rooms)
   - Floor-based unit organization

## 📋 Database Schema Changes

### New Models

#### House Model (`models/House.js`)
```javascript
{
  name: String,              // e.g., "Ankit Bhawan"
  description: String,
  landlord: ObjectId,        // ref: User
  address: {
    houseNo: String,
    village: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String
  },
  images: [String],
  totalFloors: Number,
  totalUnits: Number,
  occupiedUnits: Number
}
```

#### Floor Model (`models/Floor.js`)
```javascript
{
  house: ObjectId,           // ref: House
  floorNumber: Number,       // 0 for Ground, 1 for First, etc.
  floorName: String,         // Optional: "Ground Floor", "First Floor"
  totalUnits: Number,
  occupiedUnits: Number
}
```

### Updated Models

#### User Model (`models/User.js`)
**Before:**
```javascript
{
  accountType: "Admin" | "Landlord" | "Renter"
}
```

**After:**
```javascript
{
  accountType: "Admin" | "User",
  roles: {
    isLandlord: Boolean,     // Set to true when user adds first house
    isRenter: Boolean        // Set to true when allocated to a room
  }
}
```

#### Room Model (`models/Room.js`)
**Before:**
```javascript
{
  houseName: String,
  floorNo: Number,
  address: { ... },
  landlord: ObjectId
}
```

**After:**
```javascript
{
  house: ObjectId,           // ref: House
  floor: ObjectId,           // ref: Floor
  landlord: ObjectId,        // ref: User
  // address removed (now stored in House)
}
```

## 🔄 Migration Steps

### Step 1: Database Migration Script

Create and run this migration script to update existing data:

```javascript
// migration.js
const mongoose = require('mongoose');
const User = require('./models/User');
const House = require('./models/House');
const Floor = require('./models/Floor');
const Room = require('./models/Room');

async function migrate() {
  await mongoose.connect(process.env.MONGODB_URL);
  
  // 1. Update all existing users
  await User.updateMany(
    { accountType: { $in: ['Landlord', 'Renter'] } },
    { 
      $set: { 
        accountType: 'User',
        'roles.isLandlord': false,
        'roles.isRenter': false
      } 
    }
  );
  
  // 2. For each landlord, create houses from their rooms
  const landlords = await User.find({ accountType: 'User' });
  
  for (const landlord of landlords) {
    const rooms = await Room.find({ landlord: landlord._id });
    
    if (rooms.length === 0) continue;
    
    // Group rooms by houseName or create default house
    const groupedRooms = rooms.reduce((acc, room) => {
      const houseName = room.houseName || 'Default House';
      if (!acc[houseName]) acc[houseName] = [];
      acc[houseName].push(room);
      return acc;
    }, {});
    
    for (const [houseName, houseRooms] of Object.entries(groupedRooms)) {
      // Create house
      const house = await House.create({
        name: houseName,
        landlord: landlord._id,
        address: houseRooms[0].address || {
          city: 'Unknown',
          state: 'Unknown',
          pincode: '000000'
        },
        totalUnits: houseRooms.length,
        occupiedUnits: houseRooms.filter(r => r.status === 'Occupied').length
      });
      
      // Update user to be landlord
      await User.findByIdAndUpdate(landlord._id, {
        'roles.isLandlord': true
      });
      
      // Group rooms by floor
      const floorGroups = houseRooms.reduce((acc, room) => {
        const floorNo = room.floorNo || 0;
        if (!acc[floorNo]) acc[floorNo] = [];
        acc[floorNo].push(room);
        return acc;
      }, {});
      
      for (const [floorNo, floorRooms] of Object.entries(floorGroups)) {
        // Create floor
        const floor = await Floor.create({
          house: house._id,
          floorNumber: parseInt(floorNo),
          totalUnits: floorRooms.length,
          occupiedUnits: floorRooms.filter(r => r.status === 'Occupied').length
        });
        
        // Update house total floors
        await House.findByIdAndUpdate(house._id, {
          $inc: { totalFloors: 1 }
        });
        
        // Update rooms with house and floor references
        for (const room of floorRooms) {
          await Room.findByIdAndUpdate(room._id, {
            $set: {
              house: house._id,
              floor: floor._id
            },
            $unset: {
              houseName: '',
              floorNo: '',
              address: ''
            }
          });
          
          // If room has a renter, update renter role
          if (room.renter) {
            await User.findByIdAndUpdate(room.renter, {
              'roles.isRenter': true
            });
          }
        }
      }
    }
  }
  
  console.log('Migration completed successfully!');
  process.exit(0);
}

migrate().catch(console.error);
```

Run the migration:
```bash
node migration.js
```

### Step 2: Update API Endpoints

#### New Endpoints for House Management

**Landlord Routes** (`/api/v1/landlord`)

```
POST   /house                      - Create new house
GET    /houses                     - Get all houses for landlord
GET    /house/:houseId/overview    - Get house overview with stats
PUT    /house/:houseId             - Update house details
DELETE /house/:houseId             - Delete house (only if empty)

POST   /house/:houseId/floor       - Add floor to house
GET    /house/:houseId/floors      - Get all floors of a house
PUT    /floor/:floorId             - Update floor details
DELETE /floor/:floorId             - Delete floor (only if no units)
GET    /floor/:floorId/units       - Get floor with all units

GET    /house/:houseId/rooms       - Get all rooms in a house
GET    /floor/:floorId/rooms       - Get all rooms on a floor
DELETE /delete-vacant-room/:roomId - Delete vacant room
```

#### Updated Endpoints

**Room Creation** - Now requires house and floor:
```javascript
// OLD
POST /api/v1/landlord/post-vacant-room
{
  "houseName": "Ankit Bhawan",
  "roomNumber": "101",
  "floorNo": 1,
  "address": { ... }
}

// NEW
POST /api/v1/landlord/post-vacant-room
{
  "houseId": "507f1f77bcf86cd799439011",
  "floorId": "507f1f77bcf86cd799439012",
  "roomNumber": "101"
}
```

**Dashboard** - Now returns dual role stats:
```javascript
GET /api/v1/dashboard/stats

Response:
{
  "success": true,
  "stats": {
    "landlordStats": {
      "totalHouses": 2,
      "totalRooms": 10,
      "occupiedRooms": 7,
      // ... more stats
    },
    "renterStats": {
      "room": { ... },
      "totalBills": 5,
      // ... more stats
    },
    "unreadNotifications": 3
  },
  "userRoles": {
    "isLandlord": true,
    "isRenter": true,
    "accountType": "User"
  }
}
```

### Step 3: Update Frontend

#### Authentication Changes

**Signup** - Remove account type selection:
```javascript
// OLD
const signup = async (formData) => {
  const { firstName, lastName, email, password, accountType, otp } = formData;
  // accountType: "Landlord" or "Renter"
}

// NEW
const signup = async (formData) => {
  const { firstName, lastName, email, password, otp } = formData;
  // No accountType needed - role determined by actions
}
```

#### Dashboard Layout

Create a unified dashboard that shows both roles:

```jsx
function Dashboard({ user, stats }) {
  return (
    <div>
      {stats.userRoles.isLandlord && (
        <LandlordSection data={stats.landlordStats} />
      )}
      
      {stats.userRoles.isRenter && (
        <RenterSection data={stats.renterStats} />
      )}
      
      {!stats.userRoles.isLandlord && !stats.userRoles.isRenter && (
        <WelcomeSection>
          <p>Add a house to become a landlord</p>
          <p>Get allocated to a room to become a renter</p>
        </WelcomeSection>
      )}
    </div>
  );
}
```

#### House Management UI Flow

1. **Add House** → User becomes Landlord
2. **Add Floors** → Organize property by levels
3. **Add Rooms** → Create units on each floor
4. **Allocate Renters** → Assign tenants to rooms

### Step 4: Update Middleware

The middleware now checks dynamic roles instead of fixed accountType:

```javascript
// OLD
if (user.accountType !== 'Landlord') throw Error();

// NEW
if (!user.roles?.isLandlord) throw Error();
```

## 🔒 Security & Validation

### Room Deletion Rules

Rooms can ONLY be deleted if:
- Status is "Vacant"
- No renter is assigned
- No pending bills exist

```javascript
// Attempting to delete occupied room
DELETE /api/v1/landlord/delete-vacant-room/:roomId

Response (400):
{
  "success": false,
  "message": "Can only delete vacant rooms. Please remove the tenant first."
}
```

### Ownership Verification

All operations verify ownership through the hierarchy:
- Room → Floor → House → Landlord
- Bill → Room → House → Landlord

## 📊 Example Usage

### Complete Flow: Adding Property

```javascript
// 1. Create House
POST /api/v1/landlord/house
{
  "name": "Ankit Bhawan",
  "address": {
    "houseNo": "123",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
// Response: { houseId: "..." }

// 2. Add Floors
POST /api/v1/landlord/house/:houseId/floor
{ "floorNumber": 0, "floorName": "Ground Floor" }

POST /api/v1/landlord/house/:houseId/floor
{ "floorNumber": 1, "floorName": "First Floor" }

// 3. Add Rooms
POST /api/v1/landlord/post-vacant-room
{
  "houseId": "...",
  "floorId": "...",
  "roomNumber": "101",
  "roomType": "Flat",
  "pricePerMonth": 15000,
  "perUnitRate": 8
}

// 4. Allocate Renter
POST /api/v1/landlord/allocate-room
{
  "roomId": "...",
  "renterId": "..."
}
```

## 🚀 Benefits of New Structure

1. **Better Organization**: Properties grouped logically
2. **Scalability**: Support multiple properties per landlord
3. **Flexibility**: Dynamic roles based on actions
4. **Real-world Mapping**: Matches actual property structure
5. **Better Reporting**: House-level and floor-level analytics
6. **Cleaner Database**: Normalized data structure

## 🐛 Common Issues & Solutions

### Issue: Old users can't access landlord routes
**Solution**: Run migration script to update roles

### Issue: Existing rooms don't have house/floor
**Solution**: Migration script creates default house and floors

### Issue: Bills reference old room structure
**Solution**: Bills still reference rooms, which now have house/floor

## 📝 Testing Checklist

- [ ] User can signup without choosing role
- [ ] User becomes landlord after adding first house
- [ ] User becomes renter after room allocation
- [ ] Same user can access both landlord and renter sections
- [ ] House can have multiple floors
- [ ] Floor can have multiple rooms
- [ ] Cannot delete occupied room
- [ ] Dashboard shows both roles correctly
- [ ] Bills work with new structure
- [ ] Payments work with new structure

## 🎯 Next Steps

1. Run migration script on production database
2. Update frontend to remove role selection during signup
3. Implement house management UI
4. Add floor-based navigation
5. Update mobile apps (if any)
6. Update API documentation
7. Train users on new interface

## 📞 Support

For migration issues or questions, contact the development team.
