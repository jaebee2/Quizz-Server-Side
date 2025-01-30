const express = require('express');
const app = express();
const Datastore = require('nedb');
const database = new Datastore('database.db');
database.loadDatabase();



app.use(express.static('ihifix')); 


app.use(express.json({limit:'5mb'})); 
app.listen(3000, () => console.log('listening at 3000'));


app.post('/quizz',(request, response)=>{
    console.log('I have Recieved ')
    const data = request.body
    const timestamp = Date.now();
    data.timestamp = timestamp;
    database.insert(data);

    response.json({
        status:'done'
    })

})
