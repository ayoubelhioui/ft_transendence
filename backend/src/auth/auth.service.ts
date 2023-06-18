import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt"
import { env } from "process";
import { TokensDto } from "src/dto/tokens.dto";
import { UserDto } from "src/dto/user.dto";
import { User } from "src/entities";
import TokenBlacklist from "src/entities/token_blacklist";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthService{
    constructor(private jwtService: JwtService, private userService: UserService){}
    private payload: object;
    private userInfo: any;
    async isUserAlreadyExist(userDto: UserDto){
        this.userInfo = await this.findUserById(userDto.IntraId)
        if (!this.userInfo)
            this.userInfo = await this.userService.createUser(userDto);
        return (this.userInfo);
    }

    async authenticate(userDto: UserDto, res: any) {
        this.payload = { sub: userDto.IntraId, username: userDto.username };
        const tokens = await this.generateAuthTokens();
        res.cookie('access_token', tokens['access_token']);
        res.cookie('refresh_token', tokens['refresh_token']);
        res.redirect('http://localhost:5000/');
    }
    
    async generateNewToken(expirationTime: string) : Promise<string | undefined> {
        return (
            await this.jwtService.signAsync(this.payload, {
                expiresIn: expirationTime,
                secret: process.env.TOKEN_SECRET,
            })
        );
    }

    async findUserById(intraId: number) : Promise<object | undefined> {
        return (await this.userService.findUserById(intraId));
    }

    async removeTokens(accessToken: string, refreshToken: string){
        await this.userService.addTokenToBlacklist(accessToken);
        await this.userService.addTokenToBlacklist(refreshToken);
    }

    async isTokenInBlacklist(token: string): Promise<TokenBlacklist | undefined> {
        return (await this.userService.accessTokenInBlacklist(token));
    }

    async mailingUser(userEmail: string) {
        this.payload = { sub: userEmail };
        const emailVerificationCode: string = await this.generateNewToken('3m');
        await this.userService.sendEmail(emailVerificationCode, userEmail);
    }

    async generateAuthTokens(): Promise<object>{
        return ({
            access_token: await this.generateNewToken('4d'),
            refresh_token: await this.generateNewToken('10d'),
        });
    }

    async twoFactors(token: string, userEmail: string) {
        this.payload = await this.jwtService.verifyAsync(token, {
            secret: process.env.TOKEN_SECRET,
        });
        if (userEmail != this.payload['sub'])
            throw new ForbiddenException;
    }


}

