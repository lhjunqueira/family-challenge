import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('Hello World! teste este é o Myio API');

    return 'Hello World! teste este é o Myio API';
  }
}
