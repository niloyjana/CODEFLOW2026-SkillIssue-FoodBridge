# Firestore Database Schema Documentation

This document outlines the Firestore NoSQL database schema, query index requirements, and security rules for the FoodShareHackathon.

---

## 1. Collections Structure

### `users` Collection
Stores details for restaurants and individual volunteers.
- **Document ID**: Unique user ID (generated on registration).

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier matching Document ID. |
| `email` | `string` | User's email address. |
| `name` | `string` | Name of the restaurant or individual volunteer. |
| `type` | `string` | Enum: `'restaurant'` or `'individual'`. |
| `points` | `number` | Total reputation and activity points. |
| `phone` | `string` | (Optional) Contact phone number. |
| `address` | `string` | (Optional) Pickup address or volunteer location. |
| `lat` | `number` | (Optional) Latitude coordinates. |
| `lng` | `number` | (Optional) Longitude coordinates. |
| `notificationsEnabled` | `boolean` | Flag indicating if email/SMS notifications are enabled. |
| `createdAt` | `timestamp` | Time when account was created. |

---

### `posts` Collection
Contains details about food surplus donations.
- **Document ID**: Unique post ID.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier matching Document ID. |
| `restaurantId` | `string` | Reference ID to the creator from the `users` collection. |
| `restaurantName` | `string` | Display name of the restaurant. |
| `portions` | `number` | Number of food portions available. |
| `predictedWasteKg` | `number` | Waste weight calculated by the prediction AI. |
| `status` | `string` | Enum: `'active'`, `'claimed'`, or `'completed'`. |
| `createdAt` | `timestamp` | Time when post was submitted. |
| `pickupBy` | `timestamp` | Expiration and pickup deadline. |
| `claimedBy` | `string` | (Optional) Reference ID to the claiming volunteer. |
| `claimedByName` | `string` | (Optional) Display name of the claiming volunteer. |
| `lat` | `number` | (Optional) Latitude coordinates. |
| `lng` | `number` | (Optional) Longitude coordinates. |
| `address` | `string` | (Optional) Address where pickup is located. |

---

### `claims` Collection
Tracks pickup events and volunteer points logs.
- **Document ID**: Unique claim ID.

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique identifier matching Document ID. |
| `postId` | `string` | Reference ID to the claimed item in the `posts` collection. |
| `userId` | `string` | Reference ID to the volunteer in the `users` collection. |
| `claimedAt` | `timestamp` | Time when pickup was claimed. |
| `completedAt` | `timestamp` | (Optional) Time when pickup was completed. |
| `pointsAwarded` | `number` | Points earned for completing the pickup (typically 15). |

---

## 2. Query Index Requirements

Firestore automatically builds indexes for single fields. However, compound queries (such as listing active posts created by a specific restaurant sorted by expiration date) require composite indexes.

Create the following compound indexes:

1. **Filter Posts by Status & Expiration Time**:
   - Collection: `posts`
   - Fields: `status` (Ascending), `pickupBy` (Ascending)

2. **Filter Posts by Creator & Expiration Time**:
   - Collection: `posts`
   - Fields: `restaurantId` (Ascending), `createdAt` (Descending)

3. **Filter Claims by User & Timestamp**:
   - Collection: `claims`
   - Fields: `userId` (Ascending), `claimedAt` (Descending)

---

## 3. Firestore Security Rules

Deploy the following security rules template to enforce role limits and authorization.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  
    // Helper: Checks if the user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper: Checks if the request comes from the owner
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Rules for the users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && isOwner(userId);
      allow delete: if false; // Accounts cannot be deleted during hackathon
    }

    // Rules for the posts collection
    match /posts/{postId} {
      allow read: if isAuthenticated();
      // Only restaurants can create new posts
      allow create: if isAuthenticated() && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'restaurant';
      // Only the restaurant owner can modify details, but individuals can update status to claim
      allow update: if isAuthenticated() && (
        resource.data.restaurantId == request.auth.uid ||
        (request.resource.data.status == 'claimed' && resource.data.status == 'active')
      );
      allow delete: if isAuthenticated() && resource.data.restaurantId == request.auth.uid;
    }

    // Rules for the claims collection
    match /claims/{claimId} {
      allow read: if isAuthenticated();
      // Only individual users can claim pickups
      allow create: if isAuthenticated() && 
                    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.type == 'individual' &&
                    request.resource.data.userId == request.auth.uid;
      allow update, delete: if false; // Claims cannot be modified or deleted
    }
  }
}
```
