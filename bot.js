// Telegraf is the bot framework that simplifies dealing with telegrams bot api
const Telegraf = require('telegraf') 
const oxford = require('project-oxford')
const request = require('request')
require('dotenv').config();
const fs = require('fs')
// each bot in telegram has a unique token
const options = {
    telegram: {           // Telegram options
        agent: null,        // https.Agent instance, allows custom proxy, certificate, keep alive, etc.
        webhookReply: true  // Reply via webhook
    },
    username: 'facedetect_bot'          // Bot username (optional)  
}
// cognitive service azure face api
const client = new oxford.Client(process.env.myFaceApiKey, 'westcentralus')
const app = new Telegraf(process.env.BOT_TOKEN, options) // pass the token for the bot


const downloadPhotoMiddleware = (ctx, next) => {
    return app.telegram.getFileLink(ctx.message.photo[0])
        .then((link) => {
            ctx.state.fileLink = link
            return next()
        })
}
app.on('photo', downloadPhotoMiddleware, (ctx, next) =>{
    const photoUrl = ctx.state.fileLink
    console.log('Photo url: ' + photoUrl)
    client.face.detect({
        url: photoUrl,
        analyzesAge: true,
        analyzesGender: true
    }).then
    (
        response =>
        {
            console.log(response)
            const faceInfo = 
            {
                age: response[0].faceAttributes.age,
                gender: response[0].faceAttributes.gender
            }
            const replyMessage = `Image received, Age: ${faceInfo.age} & Gender: ${faceInfo.gender}`
            console.log(replyMessage)
            ctx.reply(replyMessage) 
        },
        error =>
        {
            console.log('Some error occurred: \n' + error.message)
        }
    )
})
app.startPolling()
console.log('Bot Running!!!')
