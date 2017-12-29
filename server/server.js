const express = require("express")
const CloudantAPI = require("./cloudant_api")
const cred = require("./cred")

var api = new CloudantAPI(cred.arabic_ref_api)
api.getDataBase((data)=>{
    console.log(data.rows[0])
})
