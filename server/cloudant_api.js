const https = require("https")
const {URL} = require("url")
/**
 * [CloudantAPI description]
 */
class CloudantAPI{

    /**
     * @param  {Object} cred - Object with api_key and api_pass keywords
     * @return {[type]}      [description]
     */
    constructor(cred){
        this.apiKey = cred.api_key
        this.apiPass = cred.api_pass
        this.dbName = cred.db
        this.hostname = "https://dshaff001.cloudant.com/"
        // this.hostname = `https://dshaff001.cloudant.com/${this.dbName}`


        // console.log(apiKey, apiPass, dbName. hostname)
    }

    callHandlers(handler, data){
        if (handler.constructor !== Array){
            handler = [handler]
        }
        handler.forEach((callback)=>{
            callback(data)
        })
    }


    /**
     * get the entire database
     * @param  {Array or Function} handler - Function or list of
     *     functions to call when response is ready
     * @return {null}
     */
    getDataBase(handler){
        // {"include_docs":True}
        var options = {
            protocol: "https:",
            hostname: `dshaff001.cloudant.com`,
            path: `/${this.dbName}/_all_docs?include_docs=true`,
            auth: `${this.apiKey}:${this.apiPass}`,
            headers: {'Content-Type':'application/json'},
            method: "GET",
        }
        var buffers = []
        var req = https.request(options, (res)=>{
            console.log(`statusCode: ${res.statusCode}`)
            // console.log(`headers: ${JSON.stringify(res.headers)}`)
            res.on("data", (data)=>{
                var strData = data.toString("utf8")
                buffers.push(strData)
                // var obj = JSON.parse(strData.substring(1))
                // var obj = ""
                // this.callHandlers(handler, obj)
            })
        })

        req.on("error", (err)=>{
            console.error(err)
        })
        req.on("close", ()=>{
            var obj = JSON.parse(buffers.join(""))
            this.callHandlers(handler, obj)
        })
        req.end()
    }

}



module.exports = CloudantAPI
