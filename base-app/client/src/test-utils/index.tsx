import {
  render as rtlRender,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
import { FC, ReactElement } from "react";
import { Provider } from "react-redux";
import { createMemoryHistory } from "history";
import { Router } from "react-router";

import { configureStoreWithMiddlewares, RootState } from "../app/store";

type CustomRenderOptions = {
  preLoadedState?: RootState;
  routeHistory?: Array<string>;
  initialRouteIndex?: number;
  renderOptions?: Omit<RenderOptions, "wrapper">;
};

function render(
  ui: ReactElement,
  { preLoadedState = {}, routeHistory, initialRouteIndex, ...renderOptions }: CustomRenderOptions = {}
): RenderResult {
  const Wrapper: FC = ({ children }) => {
    const store = configureStoreWithMiddlewares(preLoadedState);
    const history = createMemoryHistory({initialEntries: routeHistory, initialIndex: initialRouteIndex});
    return <Provider store={store}><Router history={history}>{children}</Router></Provider>;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";
export { render };
