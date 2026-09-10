import { Outlet, NavLink } from "react-router";

export default function Layout() {
  return (
    <>
      <nav>
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/sobre">Sobre</NavLink>
      </nav>
      <Outlet />
    </>
  );
}
