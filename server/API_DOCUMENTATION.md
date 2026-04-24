# Roomly API Documentation - Multi-House Management

## Base URL
```
http://localhost:4000/api/v1
```

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <token>
```

---

## 🏠 House Management

### Create House
**POST** `/landlord/house`

Creates a new house and automatically makes the user a landlord.

**Request Body:**
```json
{
  "name": "Ankit Bhawan",
  "description": "Modern residential building",
  "address": {
    "houseNo": "123",
    "village": "Sector 15",
    "landmark": "Near Metro Station",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "images": ["url1", "url2"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "House created successfully",
  "house": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Ankit Bhawan",
    "landlord": "507f1f77bcf86cd799439012",
    "address": { ... },
    "totalFloors": 0,
    "totalUnits": 0,
    "occupiedUnits": 0,
    "createdAt": "2025-11-17T10:30:00.000Z"
  }
}
```

---

### Get All Houses
**GET** `/landlord/houses`

Returns all houses owned by the landlord.

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "houses": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ankit Bhawan",
      "totalFloors": 3,
      "totalUnits": 12,
      "occupiedUnits": 8,
      "address": { ... }
    }
  ]
}
```

---

### Get House Overview
**GET** `/landlord/house/:houseId/overview`

Returns detailed overview of a specific house with statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "house": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ankit Bhawan",
      "address": { ... }
    },
    "stats": {
      "totalFloors": 3,
      "totalUnits": 12,
      "occupiedUnits": 8,
      "vacantUnits": 4,
      "occupancyRate": "66.67"
    },
    "floors": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "floorNumber": 0,
        "floorName": "Ground Floor",
        "totalUnits": 4,
        "occupiedUnits": 3
      }
    ]
  }
}
```

---

### Update House
**PUT** `/landlord/house/:houseId`

Updates house details.

**Request Body:**
```json
{
  "name": "Ankit Bhawan Updated",
  "description": "Updated description",
  "address": { ... },
  "images": ["newUrl1"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "House updated successfully",
  "house": { ... }
}
```

---

### Delete House
**DELETE** `/landlord/house/:houseId`

Deletes a house. Only works if no floors exist in the house.

**Response (200):**
```json
{
  "success": true,
  "message": "House deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Cannot delete house with existing floors. Please delete all floors first."
}
```

---

## 📁 Floor Management

### Add Floor to House
**POST** `/landlord/house/:houseId/floor`

Adds a new floor to a house.

**Request Body:**
```json
{
  "floorNumber": 0,
  "floorName": "Ground Floor"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Floor added successfully",
  "floor": {
    "_id": "507f1f77bcf86cd799439013",
    "house": "507f1f77bcf86cd799439011",
    "floorNumber": 0,
    "floorName": "Ground Floor",
    "totalUnits": 0,
    "occupiedUnits": 0
  }
}
```

---

### Get All Floors of House
**GET** `/landlord/house/:houseId/floors`

Returns all floors in a house, sorted by floor number.

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "floors": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "floorNumber": 0,
      "floorName": "Ground Floor",
      "totalUnits": 4,
      "occupiedUnits": 3
    }
  ]
}
```

---

### Get Floor with All Units
**GET** `/landlord/floor/:floorId/units`

Returns floor details along with all rooms/units on that floor.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "floor": {
      "_id": "507f1f77bcf86cd799439013",
      "floorNumber": 0,
      "floorName": "Ground Floor",
      "house": { ... }
    },
    "units": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "roomNumber": "101",
        "roomType": "Flat",
        "status": "Occupied",
        "pricePerMonth": 15000,
        "renter": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        }
      }
    ]
  }
}
```

---

### Update Floor
**PUT** `/landlord/floor/:floorId`

Updates floor details.

**Request Body:**
```json
{
  "floorName": "Updated Ground Floor"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Floor updated successfully",
  "floor": { ... }
}
```

---

### Delete Floor
**DELETE** `/landlord/floor/:floorId`

Deletes a floor. Only works if no rooms exist on the floor.

**Response (200):**
```json
{
  "success": true,
  "message": "Floor deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Cannot delete floor with existing units. Please delete all units first."
}
```

---

## 🚪 Room/Unit Management

### Get All Rooms in House
**GET** `/landlord/house/:houseId/rooms`

Returns all rooms in a specific house.

**Response (200):**
```json
{
  "success": true,
  "count": 12,
  "rooms": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "roomNumber": "101",
      "roomType": "Flat",
      "status": "Occupied",
      "floor": {
        "floorNumber": 0,
        "floorName": "Ground Floor"
      },
      "renter": { ... }
    }
  ]
}
```

---

### Get All Rooms on Floor
**GET** `/landlord/floor/:floorId/rooms`

Returns all rooms on a specific floor.

**Response:** Same as above

---

### Create Vacant Room
**POST** `/landlord/post-vacant-room`

Creates a new vacant room on a specific floor.

**Request Body:**
```json
{
  "houseId": "507f1f77bcf86cd799439011",
  "floorId": "507f1f77bcf86cd799439013",
  "roomNumber": "101",
  "roomType": "Flat",
  "pricePerMonth": 15000,
  "perUnitRate": 8,
  "features": ["AC", "Balcony", "Attached Bathroom"],
  "images": ["url1", "url2"],
  "currentMeterReading": 1000
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Vacant room posted successfully",
  "room": {
    "_id": "507f1f77bcf86cd799439014",
    "house": "507f1f77bcf86cd799439011",
    "floor": "507f1f77bcf86cd799439013",
    "roomNumber": "101",
    "status": "Vacant",
    "pricePerMonth": 15000
  }
}
```

---

### Update Vacant Room
**PUT** `/landlord/update-vacant-room/:roomId`

Updates details of a vacant room.

**Request Body:**
```json
{
  "pricePerMonth": 16000,
  "features": ["AC", "Balcony", "Attached Bathroom", "Parking"],
  "images": ["newUrl1"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Room updated successfully",
  "room": { ... }
}
```

---

### Delete Vacant Room
**DELETE** `/landlord/delete-vacant-room/:roomId`

Deletes a room. **Only works if the room is vacant** (no renter assigned).

**Response (200):**
```json
{
  "success": true,
  "message": "Room deleted successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Can only delete vacant rooms. Please remove the tenant first."
}
```

---

### Allocate Room to Renter
**POST** `/landlord/allocate-room`

Allocates a vacant room to a renter. Automatically sets the renter's role.

**Request Body:**
```json
{
  "roomId": "507f1f77bcf86cd799439014",
  "renterId": "507f1f77bcf86cd799439015"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Room allocated successfully",
  "room": {
    "_id": "507f1f77bcf86cd799439014",
    "status": "Occupied",
    "renter": "507f1f77bcf86cd799439015"
  }
}
```

---

### Update Allocated Room
**PUT** `/landlord/update-allocated-room/:roomId`

Updates details of an occupied room.

**Request Body:**
```json
{
  "pricePerMonth": 17000,
  "perUnitRate": 9,
  "features": ["AC", "New Furniture"]
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Room updated successfully",
  "room": { ... }
}
```

---

## 👤 User Management

### Signup (Updated)
**POST** `/auth/signup`

No longer requires `accountType` field. Role is determined by actions.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "middleName": "M",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User registered successfully. Your role will be determined by your actions.",
  "user": {
    "_id": "507f1f77bcf86cd799439016",
    "accountType": "User",
    "roles": {
      "isLandlord": false,
      "isRenter": false
    }
  }
}
```

---

## 📊 Dashboard (Updated)

### Get Dashboard Statistics
**GET** `/dashboard/stats`

Returns statistics for both landlord and renter roles if applicable.

**Response (200):**
```json
{
  "success": true,
  "stats": {
    "landlordStats": {
      "totalHouses": 2,
      "totalRooms": 12,
      "occupiedRooms": 8,
      "vacantRooms": 4,
      "totalRenters": 8,
      "pendingBills": 5,
      "verifiedBills": 2,
      "paidBills": 10,
      "totalRevenue": 120000,
      "occupancyRate": "66.67",
      "houses": [
        {
          "name": "Ankit Bhawan",
          "totalUnits": 12,
          "occupiedUnits": 8
        }
      ]
    },
    "renterStats": {
      "room": {
        "id": "507f1f77bcf86cd799439014",
        "roomNumber": "101",
        "roomType": "Flat",
        "pricePerMonth": 15000,
        "house": {
          "name": "Ankush Bhawan",
          "address": { ... }
        },
        "floor": {
          "floorNumber": 1,
          "floorName": "First Floor"
        },
        "landlord": {
          "firstName": "Ankush",
          "lastName": "Kumar",
          "email": "ankush@example.com"
        }
      },
      "totalBills": 6,
      "pendingBills": 1,
      "paidBills": 5,
      "totalPaid": 90000,
      "recentBills": [ ... ]
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

**Scenarios:**

1. **Only Landlord:**
   - `landlordStats`: Full data
   - `renterStats`: null

2. **Only Renter:**
   - `landlordStats`: null
   - `renterStats`: Full data

3. **Both Roles:**
   - Both sections populated

4. **New User (No Role):**
   - Both sections null
   - `userRoles.isLandlord`: false
   - `userRoles.isRenter`: false

---

## 🔐 Authorization Changes

### Middleware Behavior

**OLD:** Fixed roles during signup
```javascript
if (user.accountType !== 'Landlord') throw Error();
```

**NEW:** Dynamic roles based on actions
```javascript
if (!user.roles?.isLandlord) {
  throw Error("You need to add a house first to become a landlord");
}
```

### How Roles Are Assigned

1. **Landlord Role:**
   - Automatically assigned when user creates their first house
   - Persists even if all houses are deleted

2. **Renter Role:**
   - Automatically assigned when user is allocated to a room
   - Persists even if room allocation is removed

3. **Dual Role:**
   - User can have both roles simultaneously
   - Can manage properties as landlord
   - Can pay rent as renter in someone else's property

---

## 🔄 Migration

### Run Migration Script
```bash
node migration.js
```

This will:
1. Convert all existing users to new role system
2. Create House documents from existing rooms
3. Create Floor documents
4. Update Room documents with house/floor references
5. Set appropriate roles for existing users

---

## ⚠️ Breaking Changes

1. **Signup API:** No longer accepts `accountType` parameter
2. **Room Creation:** Now requires `houseId` and `floorId`
3. **Dashboard API:** Returns different structure with dual role stats
4. **User Model:** `accountType` values changed from `Landlord/Renter` to `User`
5. **Room Model:** No longer has `address`, `houseName`, `floorNo` fields

---

## 📞 Support

For API issues or questions, contact the development team.
Ankit Kumar
9453699626