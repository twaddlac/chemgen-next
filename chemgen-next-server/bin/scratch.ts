import {  Memoize } from 'lodash-decorators';
// import {memoize} from 'lodash';

class Animal {
  name: string;

  constructor(theName: string) {
    this.name = theName;
  }

  move(distanceInMeters: number = 0) {
    console.log(`${this.name} moved ${distanceInMeters}m.`);
  }

  @Memoize()
  // @ts-ignore
  distance(distanceInMeters: number){
    return distanceInMeters * 5;
  }

  @Memoize()
  // @ts-ignore
  fn(things: any){
    return things.value;
  }

  callsOtherfn(things: any){
    return this.fn(things);
  }
}

const myAnimal = new Animal('tiger');

myAnimal.distance(5);
myAnimal.distance(4);
myAnimal.distance(5);

console.log(myAnimal.fn({key: 'hello', value: 'world'}));
console.log(myAnimal.fn({key: 'hello', value: 'heeeeelo'}));
console.log(myAnimal.fn({key: 'hello', value: 'wheee'}));

console.log(myAnimal.callsOtherfn({key: 'hello', value: 'world'}));
console.log(myAnimal.callsOtherfn({key: 'hello', value: 'heeeeelo'}));
console.log(myAnimal.callsOtherfn({key: 'hello', value: 'wheee'}));
