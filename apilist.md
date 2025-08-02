# DevTinder APIs

## Auth router
- POST/signup
- POST/login
- POST/logout

## profile router
- GET/profile/view
- PATCH/profile/edit
- PATCH/profile/passoword.  //forgot password API

## connection request router
- POST/request/send/:status/:userId

- POST/request/review/:status/:reviewId

## user router
- GET/user/requests/recieved
- GET/user/connections
- GET/user/feed  - gets you the profiles of other users on platform


NOTES
# pagination
.skip() & .limit()

/feed?page=1&limit=10 => .skip(0) & .limit(10)

skip =(page-1)* limit





