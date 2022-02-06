# An experiment with webrtc

## To play around you need to:

1. `npm start` which starts the node server
2. `npm run client` which open the `client` folder in a local web server

## The dance

1. User1 sends an "offer2"
2. User2 accepts offer as "remote description"
3. User2 replies with an answer (also sets it as "local description")
4. User1 accepts answer
5. Listen for ICE candidates and exchange them

## Tips

- Candidate gathering starts when you call `setLocalDescription()`

### Good resources

- https://hpbn.co/webrtc/
- https://codelabs.developers.google.com/codelabs/webrtc-web/#0
