import {
  render as rtlRender,
  RenderOptions,
  RenderResult,
} from "@testing-library/react";
import { FC, ReactElement } from "react";
import { Provider } from "react-redux";

import { configureStoreWithMiddlewares, RootState } from "../app/store";

type CustomRenderOptions = {
  preLoadedState?: RootState;
  renderOptions?: Omit<RenderOptions, "wrapper">;
};

function render(
  ui: ReactElement,
  { preLoadedState = {}, ...renderOptions }: CustomRenderOptions = {}
): RenderResult {
  const Wrapper: FC = ({ children }) => {
    const store = configureStoreWithMiddlewares(preLoadedState);
    return <Provider store={store}>{children}</Provider>;
  };

  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

export * from "@testing-library/react";
export { render };
