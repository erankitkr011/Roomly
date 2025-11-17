# 🚀 Deployment Checklist - Roomly Multi-House System

## Pre-Deployment Checks

### ✅ Code Review
- [ ] All new models created (House, Floor)
- [ ] Room model updated with house/floor references
- [ ] User model updated with dynamic roles
- [ ] All services implemented and tested
- [ ] All controllers updated
- [ ] All routes added and tested
- [ ] Middleware updated for role checking
- [ ] No console errors or warnings

### ✅ Database
- [ ] MongoDB connection string configured
- [ ] Environment variables set up
- [ ] Migration script tested on development database
- [ ] Backup of production database taken

### ✅ Testing
- [ ] All new endpoints tested with Postman/Thunder Client
- [ ] Signup without role selection works
- [ ] House creation assigns landlord role
- [ ] Room allocation assigns renter role
- [ ] Dual role scenario tested
- [ ] Dashboard returns correct data for both roles
- [ ] Room deletion validation works
- [ ] Floor/House deletion validation works

### ✅ Documentation
- [ ] API_DOCUMENTATION.md reviewed
- [ ] MIGRATION_GUIDE.md reviewed
- [ ] QUICK_START.md reviewed
- [ ] README.md updated
- [ ] IMPLEMENTATION_SUMMARY.md reviewed

---

## Deployment Steps

### Step 1: Backup Current System
```bash
# Backup MongoDB database
mongodump --uri="mongodb://your-connection-string" --out=./backup-before-migration

# Backup code
git commit -m "Backup before multi-house migration"
git tag backup-pre-multihouse
```

### Step 2: Deploy New Code
```bash
# Pull latest changes
git pull origin main

# Install any new dependencies (if any)
npm install

# Restart server
pm2 restart roomly-server
# OR
npm start
```

### Step 3: Run Migration Script
```bash
# Run migration on production database
NODE_ENV=production node migration.js

# Verify migration success
# Check console output for summary statistics
```

### Step 4: Verify Migration
```bash
# Connect to MongoDB and verify:
# 1. House collection exists
db.houses.countDocuments()

# 2. Floor collection exists
db.floors.countDocuments()

# 3. Users have roles field
db.users.findOne({}, { roles: 1 })

# 4. Rooms have house and floor references
db.rooms.findOne({}, { house: 1, floor: 1 })
```

### Step 5: Test New Endpoints
```bash
# Test house creation
curl -X POST http://your-domain/api/v1/landlord/house \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'

# Test dashboard
curl -X GET http://your-domain/api/v1/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 6: Monitor Logs
```bash
# Watch server logs for errors
pm2 logs roomly-server
# OR
tail -f logs/server.log
```

---

## Post-Deployment Verification

### ✅ System Health Checks
- [ ] Server is running without errors
- [ ] MongoDB connections stable
- [ ] All existing endpoints still work
- [ ] New endpoints respond correctly
- [ ] Authentication working
- [ ] Role assignment working

### ✅ Data Integrity Checks
```javascript
// Run these queries in MongoDB shell

// 1. Check all users have roles field
db.users.find({ roles: { $exists: false } }).count()
// Should be 0

// 2. Check all rooms have house/floor
db.rooms.find({ 
  $or: [
    { house: { $exists: false } },
    { floor: { $exists: false } }
  ]
}).count()
// Should be 0

// 3. Check house counts are accurate
db.houses.aggregate([
  {
    $lookup: {
      from: "rooms",
      localField: "_id",
      foreignField: "house",
      as: "rooms"
    }
  },
  {
    $project: {
      name: 1,
      totalUnits: 1,
      actualCount: { $size: "$rooms" }
    }
  },
  {
    $match: {
      $expr: { $ne: ["$totalUnits", "$actualCount"] }
    }
  }
])
// Should return empty array

// 4. Check floor counts are accurate
db.floors.aggregate([
  {
    $lookup: {
      from: "rooms",
      localField: "_id",
      foreignField: "floor",
      as: "rooms"
    }
  },
  {
    $project: {
      floorNumber: 1,
      totalUnits: 1,
      actualCount: { $size: "$rooms" }
    }
  },
  {
    $match: {
      $expr: { $ne: ["$totalUnits", "$actualCount"] }
    }
  }
])
// Should return empty array
```

### ✅ User Experience Checks
- [ ] Existing landlords can access their properties
- [ ] Existing renters can access their rooms
- [ ] Dashboard shows correct information
- [ ] Bills are still accessible
- [ ] Payments are still accessible
- [ ] Chat functionality still works
- [ ] Notifications still work

---

## Rollback Plan (If Needed)

### If Migration Fails:

#### Step 1: Stop Server
```bash
pm2 stop roomly-server
```

#### Step 2: Restore Database
```bash
# Restore from backup
mongorestore --uri="mongodb://your-connection-string" --drop ./backup-before-migration
```

#### Step 3: Revert Code
```bash
git checkout backup-pre-multihouse
npm install
```

#### Step 4: Restart Server
```bash
pm2 start roomly-server
```

---

## Frontend Updates Required

### ⚠️ Important Frontend Changes

1. **Signup Form**
   - Remove account type selection dropdown
   - Remove "Landlord" and "Renter" options
   - Update API call to not send accountType

2. **Dashboard**
   - Add support for dual role display
   - Show landlord section if `userRoles.isLandlord`
   - Show renter section if `userRoles.isRenter`
   - Show "Get Started" section if neither role

3. **Property Management**
   - Add house creation interface
   - Add floor management interface
   - Update room creation to include house/floor selection
   - Add house/floor navigation

4. **Room Creation**
   - Replace houseName input with house selector
   - Replace floorNo input with floor selector
   - Remove address fields (now at house level)

5. **Room Display**
   - Show house name from populated data
   - Show floor information
   - Update any hardcoded paths

---

## Communication Plan

### ✅ User Notifications

#### Email to All Users:
```
Subject: Exciting Update - Multi-House Management Now Available!

Dear Roomly User,

We're excited to announce a major update to Roomly!

What's New:
✅ Manage multiple properties from one account
✅ Organize properties by houses and floors
✅ Be both a landlord and a renter simultaneously
✅ Better dashboard with complete overview

What Changed:
- No need to select role during signup
- You become a landlord when you add a house
- You become a renter when allocated to a room

Your existing data has been automatically migrated to the new structure.

Need Help? Check our updated documentation or contact support.

Happy managing!
The Roomly Team
```

#### In-App Notification:
```
"🎉 New Feature: Multi-House Management! Organize your properties by houses and floors. Check out your updated dashboard!"
```

---

## Success Criteria

Deployment is successful if:
- ✅ Migration completes without errors
- ✅ All existing data is preserved
- ✅ All users can login successfully
- ✅ Existing landlords see their properties
- ✅ Existing renters see their rooms
- ✅ New house creation works
- ✅ Dashboard shows dual roles correctly
- ✅ No data loss or corruption
- ✅ Performance is maintained
- ✅ No critical bugs reported

---

## Monitoring

### Metrics to Track

1. **System Metrics**
   - Server response times
   - Database query performance
   - Error rates
   - API endpoint usage

2. **User Metrics**
   - Login success rate
   - House creation rate
   - Room allocation rate
   - Dashboard load time

3. **Business Metrics**
   - Number of houses created
   - Number of users with dual roles
   - Migration success rate
   - User retention

### Monitoring Tools
- [ ] Server logs configured
- [ ] Database monitoring active
- [ ] Error tracking configured (e.g., Sentry)
- [ ] Performance monitoring active (e.g., New Relic)

---

## Support Plan

### Common User Questions

**Q: Where did my account type go?**
A: We now use dynamic roles. You'll automatically become a landlord when you add a house, or a renter when allocated to a room.

**Q: Can I still access my old properties?**
A: Yes! All your data has been migrated. Your rooms are now organized under houses and floors.

**Q: How do I add a new property?**
A: Create a house first, then add floors, then add rooms to those floors.

**Q: Can I be both landlord and renter?**
A: Yes! This is now fully supported. Your dashboard will show both sections.

---

## Emergency Contacts

- **System Admin:** [Contact Info]
- **Database Admin:** [Contact Info]
- **Lead Developer:** [Contact Info]
- **Support Team:** [Contact Info]

---

## Final Checklist

Before considering deployment complete:
- [ ] Migration ran successfully
- [ ] All tests passed
- [ ] No critical errors in logs
- [ ] Sample user accounts tested
- [ ] Dashboard verified
- [ ] New features work correctly
- [ ] Old features still work
- [ ] Documentation updated
- [ ] Users notified
- [ ] Monitoring active
- [ ] Support team briefed

---

## 🎉 Deployment Complete!

Congratulations! The Roomly Multi-House System is now live!

Monitor closely for the first 24-48 hours and be ready to respond to user feedback.

Date Deployed: _______________
Deployed By: _______________
Migration Duration: _______________
Number of Records Migrated: _______________
