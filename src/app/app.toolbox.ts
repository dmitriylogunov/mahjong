export class AppToolbox {
  // returns random integer in [0..number)
  public static random(range: number): number {
    return Math.floor(Math.random() * range) + 1;
  }
}
