import { dispatch, subscribe, TEST_cleanup } from "./tidux";

beforeEach(TEST_cleanup);

test("Should dispatch sync action properly", () => {
  let $count = 0;
  const fn = jest.fn();
  const Increase = () => $count++;
  subscribe(fn);
  dispatch(Increase);
  dispatch(Increase);
  expect($count).toBe(2);
  expect(fn).toBeCalledTimes(2);
});

test("Should dispatch async action properly", async () => {
  let $count = 0;
  const fn = jest.fn();
  const Increase = async () => {
    await delay(100);
    $count++;
    return true;
  };
  subscribe(() => {
    fn();
  });
  dispatch(Increase);
  await delay(150);
  expect($count).toBe(1);
  expect(fn).toBeCalledTimes(1);
});

function delay(interval, value) {
  return new Promise(resolve => setTimeout(resolve, interval, value));
}
