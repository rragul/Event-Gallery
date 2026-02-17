
# DynamoDB Data Model – Event Gallery Face Recognition System

## Table
EventGalleryTable  
Primary Key: PK, SK

## Access Patterns

| # | Access Pattern | PK | SK / Condition | Index |
|---|---------------|----|----------------|-------|
| 1 | Get event by QR code | QR#<qrCode> | EVENT#<eventId> | GSI1 |
| 2 | Get event details | EVENT#<eventId> | METADATA | Base |
| 3 | Get events by host | HOST#<hostId> | EVENT#<date>#<eventId> | Base |
| 4 | Get albums in event | EVENT#<eventId> | ALBUM#* | Base |
| 5 | Get photos in album | ALBUM#<albumId> | PHOTO#* | Base |
| 6 | Register attendee | EVENT#<eventId> | ATTENDEE#<attendeeId> | Base |
| 7 | Get event attendees | EVENT#<eventId> | ATTENDEE#* | Base |
| 8 | Register face | EVENT#<eventId> | FACE#<faceId> | Base |
| 9 | Get faces in event | EVENT#<eventId> | FACE#* | Base |
|10 | Photo → attendee | PHOTO#<photoId> | USER#<attendeeId> | Base |
|11 | Attendee photos | USER#<attendeeId> | EVENT#<eventId>#PHOTO#* | Base |
|12 | Processing queue | STATUS#PENDING | UPLOADED#<ts> | GSI2 |
|13 | User notifications | USER#<userId> | NOTIFICATION#* | Base |
|14 | Audit logs | AUDIT | <ts>#<entity>#<action> | Base |

## Item Shapes

### Event
PK = EVENT#E123  
SK = METADATA

### Album
PK = EVENT#E123  
SK = ALBUM#A001

### Photo
PK = ALBUM#A001  
SK = PHOTO#P001

### Attendee
PK = EVENT#E123  
SK = ATTENDEE#U001

### Face
PK = EVENT#E123  
SK = FACE#F001

### Photo → User
PK = PHOTO#P001  
SK = USER#U001

### User → Photo
PK = USER#U001  
SK = EVENT#E123#PHOTO#P001

### Notification
PK = USER#U001  
SK = NOTIFICATION#<ts>

### Audit
PK = AUDIT  
SK = <ts>#EVENT#CREATE
