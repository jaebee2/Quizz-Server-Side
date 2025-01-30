const express = require('express');
const app = express();


app.use(express.static('ihifix')); 


app.use(express.json({limit:'5mb'})); 
app.listen(3000, () => console.log('listening at 3000'));


app.post('/quizz',(request, response)=>{
    console.log('I have Recieved ')
    const data = request.body
    
    response.json({
        status:'done'
    })

})
