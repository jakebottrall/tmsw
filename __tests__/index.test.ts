import { sayHello } from "../src";

describe("sayHello", () => {
  it("says hello", () => {
    expect(sayHello("world")).toEqual("hello world");
  });
});
