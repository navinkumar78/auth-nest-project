import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (user) {
      return user;
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async login(user: any) {
    const checkIfUserExists = await this.usersService.findByUsername(user.username);
    if(!checkIfUserExists) {
      throw new UnauthorizedException('User does not exist');
    } 
    return {
      access_token:await this.jwtService.signAsync({
        username: user.username,
        sub: user._id,
      }),
    };
  }

  // async register(username: string, password: string) {
  //   const newUser = await this.usersService.create(username, password);

  //   // Automatically generate token after registration
  //   const token = this.jwtService.sign({
  //     username: newUser.username,
  //     sub: newUser._id,
  //   });

  //   return {
  //     message: 'User registered successfully',
  //     access_token: token,
  //   };
  // }
  async register(username: string, password: string) {
  const existingUser = await this.usersService.findByUsername(username);
  if (existingUser) {
    throw new UnauthorizedException('Username already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await this.usersService.create(username, hashedPassword);

  const token = this.jwtService.sign({
    username: newUser.username,
    // sub: newUser._id,
  });

  return {
    message: 'User registered successfully',
    access_token: token,
  };
}

}
