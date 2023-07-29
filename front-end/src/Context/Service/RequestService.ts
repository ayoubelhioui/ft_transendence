import { useEffect, useState } from "react";
import { AuthService } from "./AuthService";
import AxiosInstance from "./AxiosInstance";
import { STATUS_ERROR, STATUS_SUCCESS, STATUS_UNDEFINED } from "../../Const";

export interface RequestResultI {
    status : number,
    message : string,
    data : any
}

export class RequestService {
    
    private authService : AuthService

    constructor(authService : AuthService) {
        this.authService = authService
    }

    get getAuthService() {
        return this.authService
    }

    private static async makeGetRequest(obj : RequestService, url : string) {
        try {
            const response = await AxiosInstance.get(url, {
                headers: {
                    Authorization: `Bearer ${obj.authService.getAccessToken}`,
                }
            });
            return ({
                status : STATUS_SUCCESS,
                message : "Success",
                data : response.data
            })
        } catch (error : any) {
            console.log(error)
            return ({
                status : STATUS_ERROR,
                message : "Failed to fetch from " + url + " Error: " + error,
                data : undefined
            })
        }
    }

    private static async makePostRequest(obj : RequestService, url : string, payload : any) {
        try {
            const response = await AxiosInstance.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${obj.authService.getAccessToken}`,
                }
            });
            let ret = ({
                status : STATUS_SUCCESS,
                message : "Success",
                data : response.data
            })
            console.log(ret)
            return (ret)
        } catch (error : any) {
            console.log(error)
            let ret = ({
                status : STATUS_ERROR,
                message : "Failed to post to " + url + " Error: " + error,
                data : undefined
            })
            console.log(ret)
            return (ret)
        }
    }

    private static async makePutRequest(obj : RequestService, url : string, payload : any) {
        try {
            const response = await AxiosInstance.put(url, payload, {
                headers: {
                    Authorization: `Bearer ${obj.authService.getAccessToken}`,
                }
            });
            let ret = ({
                status : STATUS_SUCCESS,
                message : "Success",
                data : response.data
            })
            console.log(ret)
            return (ret)
        } catch (error : any) {
            console.log(error)
            let ret = ({
                status : STATUS_ERROR,
                message : "Failed to put to " + url + " Error: " + error,
                data : undefined
            })
            console.log(ret)
            return (ret)
        }
    }

    private static async makeDeleteRequest(obj : RequestService, url : string) {
        try {
            const response = await AxiosInstance.delete(url, {
                headers: {
                    Authorization: `Bearer ${obj.authService.getAccessToken}`,
                }
            });
            let ret = ({
                status : STATUS_SUCCESS,
                message : "Success",
                data : response.data
            })
            console.log(ret)
            return (ret)
        } catch (error : any) {
            console.log(error)
            let ret = ({
                status : STATUS_ERROR,
                message : "Failed to put to " + url + " Error: " + error,
                data : undefined
            })
            console.log(ret)
            return (ret)
        }
    }
    
    private getData(fun : (obj : RequestService, url : string) => Promise<RequestResultI>, url : string, dips : any[] = []) {
        const [state, setState] = useState<RequestResultI>({
            status : STATUS_UNDEFINED,
            message : "",
            data : undefined
        })
    
        useEffect(() => {
            const obj = this
            async function loadData() {
                setState(await fun(obj, url))
            }
            loadData()
        }, dips)
    
        return (state)
    }


    //====================================================
    //====================================================

    getLivesRequest() {
        return this.getData(RequestService.makeGetRequest, "/games/live")
    }

    getResultsRequest() {
        return this.getData(RequestService.makeGetRequest, "/games/latestResult")
    }

    getTopPlayersRequest() {
        return this.getData(RequestService.makeGetRequest, "/games/leaderboard")
    }

    // ==== Profile ====================================================

    getUserMatchHistoryRequest(userId : number) {
        return this.getData(RequestService.makeGetRequest, `/users/${userId}/matchhistory`)
    }
    
    //achievements
    getUserAchievementsRequest(userId : number) {
        return this.getData(RequestService.makeGetRequest, `/users/${userId}/achievements`)
    }

    // ==== Chat ====================================================
    
    getChannelUsers(channelId : number) {
        //return this.getData(RequestService.makeGetRequest, `/channels/${channelId}/users`)
        return RequestService.makeGetRequest(this, `/channels/${channelId}/users`)
    }

    getMyChannelsRequest(dips : any[] = []) {
        //return RequestService.makeGetRequest(this, `/users/me/channels`)
        return this.getData(RequestService.makeGetRequest, "/users/me/channels", dips)
    }

    getChannelsRequest() {
        return this.getData(RequestService.makeGetRequest, "/channels")
    }

    //!channelInfo
    getChannelUsersRequest(channelId : number) {
        return this.getData(RequestService.makeGetRequest, `/channels/${channelId}/users`)
    }

    //!messages
    getChannelMessagesRequest(channelId : number, date : string | undefined = undefined) {
        let a = !date ? "" : `?date=${date}`
        return RequestService.makeGetRequest(this, `/channels/${channelId}/messages${a}`)
        //return this.getData(RequestService.makeGetRequest, `/channels/${channelId}/messages${a}`)
    }

    async postJoinChannelRequest(channelId : number, payload : any = {}) {
        return await RequestService.makePostRequest(this,`/channels/${channelId}/join`, payload)
    }

    async postMessageRequest(channelId : number, payload : any = {}) {
        return await RequestService.makePostRequest(this,`/channels/${channelId}/messages`, payload)
    }

    // ==== Profile ====================================================

    async getUsersSearchRequest(search : string) {
        //return this.getData(RequestService.makeGetRequest, `/users/search/${search}`)
        return await RequestService.makeGetRequest(this, `/users/search/${search}`)
    }

    async getSecretKeyRequest() {
        return await RequestService.makeGetRequest(this, `/auth/generate-secret-two-factor`)
    }

     // ==== Friends ====================================================

    //users/me/friends
    async deleteBlockFriend(targetUserId : number) {
        return await RequestService.makeDeleteRequest(this, `/users/me/friends/${targetUserId}/block`)
    }

    async deleteUnblockFriend(targetUserId : number) {
        return await RequestService.makeDeleteRequest(this, `/users/me/friends/${targetUserId}/unblock`)
    }

    async deleteFriend(targetUserId : number) {
        return await RequestService.makeDeleteRequest(this, `/users/me/friends/${targetUserId}`)
    }

    //users/me/friend-requests
    async postRequestFriend(targetUserId : number) {
        return await RequestService.makePostRequest(this, `/users/me/friend-requests/${targetUserId}`, {})
    }

    async putAcceptFriend(targetUserId : number) {
        return await RequestService.makePutRequest(this, `/users/me/friend-requests/${targetUserId}`, {})
    }

    async deleteRefuseFriend(targetUserId : number) {
        return await RequestService.makeDeleteRequest(this, `/users/me/friend-requests/${targetUserId}`)
    }


    //auth
    async postVerifyEnableTwoFactorRequest(payload : any = {}) {
        return await RequestService.makePostRequest(this, '/auth/two-factors-verify-store', payload)
    }

    async postVerifyTwoFactorRequest(payload : any = {}) {
        return await RequestService.makePostRequest(this, '/auth/two-factors-verify', payload)
    }

    async postDisableTwoFactorsRequest(payload : any = {}) {
        return await RequestService.makePostRequest(this, '/auth/disable-two-factors', payload)
    }
    
    //users
    async putUpdateUserNameRequest(payload : any = {}) {
        return await RequestService.makePutRequest(this, '/users/update', payload)
    }

    async putUpdateUserImageRequest(intraId : number, payload : any = {}) {
        return await RequestService.makePutRequest(this, `/users/image/${intraId}`, payload)
    }

    async postGroupImageRequest(payload : any = {}) {
        return await RequestService.makePutRequest(this, `/users/image/channel`, payload)
    }

}
    
