# 🚀 Quick Start Guide - Roomly Multi-House System

## For Existing Users (Migration)

If you already have data in your Roomly database, run the migration script first:

```bash
cd server
node migration.js
```

This will convert your existing data to the new structure.

---

## For New Users

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Setup Environment Variables
Create `.env` file with your credentials (see README.md)

### 3. Start the Server
```bash
npm start
```

---

## 🏠 Using the Multi-House System

### Step 1: User Signup (No Role Selection!)

**POST** `/api/v1/auth/signup`

```json
{
  "firstName": "Ankit",
  "lastName": "Kumar",
  "email": "ankit@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "otp": "123456"
}
```

✅ User is created as "User" (not Landlord or Renter)
✅ Roles will be assigned based on actions

---

### Step 2: Create Your First House (Become a Landlord!)

**POST** `/api/v1/landlord/house`

```json
{
  "name": "Ankit Bhawan",
  "description": "My first rental property",
  "address": {
    "houseNo": "123",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
```

✅ User automatically becomes a Landlord
✅ House is created

---

### Step 3: Add Floors to Your House

**POST** `/api/v1/landlord/house/{houseId}/floor`

```json
{
  "floorNumber": 0,
  "floorName": "Ground Floor"
}
```

Add more floors:
```json
{
  "floorNumber": 1,
  "floorName": "First Floor"
}
```

---

### Step 4: Add Rooms/Units to Floors

**POST** `/api/v1/landlord/post-vacant-room`

```json
{
  "houseId": "your_house_id",
  "floorId": "your_floor_id",
  "roomNumber": "101",
  "roomType": "Flat",
  "pricePerMonth": 15000,
  "perUnitRate": 8,
  "features": ["AC", "Balcony", "Attached Bathroom"],
  "currentMeterReading": 1000
}
```

---

### Step 5: Add a Renter

First, the renter must signup (same as Step 1).

Then allocate them to a room:

**POST** `/api/v1/landlord/allocate-room`

```json
{
  "roomId": "your_room_id",
  "renterId": "renter_user_id"
}
```

✅ Renter automatically gets "Renter" role
✅ Room status changes to "Occupied"

---

## 📊 Check Dashboard

**GET** `/api/v1/dashboard/stats`

You'll see:
- **Landlord Section**: If you own any houses
- **Renter Section**: If you're renting any room
- **Both Sections**: If you're both landlord and renter!

---

## 🏢 Example: Complete Property Setup

Let's create "Ankit Bhawan" with 2 floors and 4 units:

### 1. Create House
```bash
POST /api/v1/landlord/house
{
  "name": "Ankit Bhawan",
  "address": {
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  }
}
# Response: houseId = "abc123"
```

### 2. Add Ground Floor
```bash
POST /api/v1/landlord/house/abc123/floor
{
  "floorNumber": 0,
  "floorName": "Ground Floor"
}
# Response: floorId = "floor1"
```

### 3. Add First Floor
```bash
POST /api/v1/landlord/house/abc123/floor
{
  "floorNumber": 1,
  "floorName": "First Floor"
}
# Response: floorId = "floor2"
```

### 4. Add Rooms on Ground Floor
```bash
POST /api/v1/landlord/post-vacant-room
{
  "houseId": "abc123",
  "floorId": "floor1",
  "roomNumber": "G-1",
  "roomType": "Shop",
  "pricePerMonth": 25000
}

POST /api/v1/landlord/post-vacant-room
{
  "houseId": "abc123",
  "floorId": "floor1",
  "roomNumber": "G-2",
  "roomType": "Flat",
  "pricePerMonth": 20000
}
```

### 5. Add Rooms on First Floor
```bash
POST /api/v1/landlord/post-vacant-room
{
  "houseId": "abc123",
  "floorId": "floor2",
  "roomNumber": "101",
  "roomType": "Flat",
  "pricePerMonth": 18000
}

POST /api/v1/landlord/post-vacant-room
{
  "houseId": "abc123",
  "floorId": "floor2",
  "roomNumber": "102",
  "roomType": "Room",
  "pricePerMonth": 12000
}
```

### 6. View House Overview
```bash
GET /api/v1/landlord/house/abc123/overview

# Response:
{
  "house": { "name": "Ankit Bhawan", ... },
  "stats": {
    "totalFloors": 2,
    "totalUnits": 4,
    "occupiedUnits": 0,
    "vacantUnits": 4,
    "occupancyRate": "0.00"
  },
  "floors": [...]
}
```

---

## 🎭 Dual Role Example

### Scenario: Ankit owns "Ankit Bhawan" and rents a flat in "Ankush Bhawan"

1. **Ankit creates "Ankit Bhawan"**
   - ✅ Becomes Landlord
   - Can add floors, rooms, renters

2. **Ankush (another user) allocates Ankit to a room in "Ankush Bhawan"**
   - ✅ Ankit becomes Renter
   - Can view bills, pay rent, chat with landlord

3. **Ankit's Dashboard shows both:**
   ```json
   {
     "landlordStats": {
       "totalHouses": 1,
       "totalRooms": 4,
       ...
     },
     "renterStats": {
       "room": { "roomNumber": "101", ... },
       "pendingBills": 1,
       ...
     }
   }
   ```

---

## 🔍 Common Operations

### View All Your Houses
```bash
GET /api/v1/landlord/houses
```

### View All Floors in a House
```bash
GET /api/v1/landlord/house/{houseId}/floors
```

### View All Rooms in a House
```bash
GET /api/v1/landlord/house/{houseId}/rooms
```

### View All Rooms on a Floor
```bash
GET /api/v1/landlord/floor/{floorId}/rooms
```

### Delete a Vacant Room
```bash
DELETE /api/v1/landlord/delete-vacant-room/{roomId}
# Only works if room is vacant!
```

---

## ⚠️ Important Rules

### Room Deletion
- ✅ Can delete if status = "Vacant"
- ❌ Cannot delete if status = "Occupied"
- ❌ Cannot delete if renter exists

### Floor Deletion
- ✅ Can delete if no rooms exist
- ❌ Cannot delete if rooms exist

### House Deletion
- ✅ Can delete if no floors exist
- ❌ Cannot delete if floors exist

**Solution:** Delete in order: Rooms → Floors → House

---

## 🐛 Troubleshooting

### "This is a protected route for Landlords only"
**Solution:** Create a house first to become a landlord

### "House not found or doesn't belong to you"
**Solution:** Check if you're using the correct houseId

### "Can only delete vacant rooms"
**Solution:** Remove the tenant first, then delete the room

### "Cannot delete floor with existing units"
**Solution:** Delete all rooms on the floor first

---

## 📚 Documentation

- Full API docs: `API_DOCUMENTATION.md`
- Migration guide: `MIGRATION_GUIDE.md`
- Project README: `README.md`

---

## 🎉 Success!

You now have a complete multi-house property management system!

Users can:
- Own multiple houses (Landlord)
- Rent rooms from others (Renter)
- Do both simultaneously (Dual Role)
- Organize properties by houses and floors
- Have a unified dashboard showing all activities

Happy managing! 🏠
