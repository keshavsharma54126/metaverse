import axios2 from "axios";
const BACKEND_URL = "http://localhost:3000";
const WS_URL = "ws://localhost:3001";

const axios ={
    post: async (...args)=>{
        try{
            const res = axios2.post(...args)
            return res
        }catch(e){
            return e.response
        }
    },
    get:async (...args)=>{
        try{
            const res = axios2.get(...args)
            return res
        }catch(e){
            return e.response
        }
    },
    put:async (...args)=>{
        try{
            const res = axios2.put(...args)
            return res
        }catch(e){
            return e.response
        }
    },
    delete:async (...args)=>{
        try{
            const res = axios2.delete(...args)
            return res
        }catch(e){
            return e.response
        }
    }
}

describe("Authentication",()=>{
    test("user is able to signup only once",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            useranme,
            passowrd,
            type:"admin"
        })
        expect(res.status).toBe(200)
        const updatedRes = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            useranme,
            passowrd,
            type:"admin"
        })
        expect(updatedRes.status).toBe(400)
    })
    test("Signup request fails if username is not provided",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/api/v1/signup`,{
            password,
            type:"admin"
        })
        expect(res.status).toBe(400)
    })
    test("Signin successfull if username and password are correct",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password
        })
        expect(res.status).toBe(200)
        expect(res.data.token).toBeDefined()
    })
    test("Signin fails if the username and password are incorrect",async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username:'wrongusername',
            password
        })
        expect(res.status).toBe(400)
        const updatedRes = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password:'wrongpassword'
        })
        expect(updatedRes.status).toBe(400)
    })

})

describe("user metadata endpoint",()=>{
    let token ;
    let avatarId;
    beforeAll(async()=>{
        const username = `keshav${Math.random()}`
        const password = "keshav1234"
        const res = await axios.post(`${BACKEND_URL}/api/v1/sigup`,{
            username,
            password,
            type:"admin"
        })
        const res2 = await axios.post(`${BACKEND_URL}/api/v1/signin`,{
            username,
            password
        })
        token = res2.data.token

        const res3 =  await axios.get(`${BACKEND_URL}/api/v1/admin/avatar`,{
            "imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s",
            "name": "Timmy"
        },{
            headers:{
                Authorization:token
            }
        })
        console.log(`avtar id is ${res3.data.avatarId}`)
        avatarId = res3.data.avatarId
    })
    test ("user is not able to update their metadata if the avtarid is not correct",async()=>{
        const res = await axios.put(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId:"wrongavatarid"
        },{
            headers:{
                Authorization:token
            }
        })
        expect(res.status).toBe(400)
    })
    test("user can update their metadata if the avatarid is correct",async()=>{
        const res= await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId:avatarId
        },{
            headers:{
                Authorization:token
            }
        })
        expect(res.status).toBe(400)
    })
    test("user can not update their metadat if the token is not present",async()=>{
        const res = await axios.post(`${BACKEND_URL}/api/v1/user/metadata`,{
            avatarId:avatarId
        })
        expect(res.status).toBe(400)
    })


})

describe()
describe()
describe()