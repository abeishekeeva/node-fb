# node-fb

This is a little function with an example code that can be used for sending push-notifications via Firebase service. 

The function can be used within the usual routing, e.g. 

```
app.post('/sendtofb', (req, res) => {
  
  ...
  sendToFirebase(req, res); 
  ...

})
```
