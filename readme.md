# tidux

Fast, small state management lib for React

## Features

1. No store needed
1. No Provider needed
1. No reducer needed
1. No action types needed
1. Fluently state mutating, just assign new values to writable variables
1. Simple API: subscribe, dispatch, useSelector
1. Handling future action dispatching easily
1. Support cancellable async dispatching
1. Best for code splitting

## Basic Counter

```jsx harmony
import React from "react";
import { dispatch, useSelector } from "tidux";

let $count = 0;
const Increase = () => $count++;
const App = () => {
  const count = useSelector(() => $count);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => dispatch(Increase)}>Increase</button>
    </>
  );
};
```

## Async Counter

```jsx harmony
import React from "react";
import { dispatch, useSelector, delay } from "tidux";

let $count = 0;
const Increase = async () => {
  await delay(1000);
  $count++;
};
const App = () => {
  const count = useSelector(() => $count);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => dispatch(Increase)}>Increase</button>
    </>
  );
};
```

## Calling another action inside current action (unsafe way)

```jsx harmony
import React from "react";
import { dispatch, useSelector, delay } from "tidux";

let $count = 0;
const Increase = () => $count++;
const IncreaseAsync = async () => {
  await delay(1000);
  Increase();
};
const App = () => {
  const count = useSelector(() => $count);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => dispatch(Increase)}>Increase</button>
      <button onClick={() => dispatch(IncreaseAsync)}>Increase Async</button>
    </>
  );
};
```

## Calling another action inside current action (safe way)

```jsx harmony
import React from "react";
import { dispatch, useSelector, delay } from "tidux";

let $count = 0;
const Increase = () => $count++;
const IncreaseAsync = async (payload, { dispatch }) => {
  await delay(1000);
  dispatch(Increase);
};
const App = () => {
  const count = useSelector(() => $count);
  return (
    <>
      <h1>{count}</h1>
      <button onClick={() => dispatch(Increase)}>Increase</button>
      <button onClick={() => dispatch(IncreaseAsync)}>Increase Async</button>
    </>
  );
};
```
