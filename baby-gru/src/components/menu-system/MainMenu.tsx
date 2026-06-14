import { useDispatch, useSelector } from "react-redux";
import { memo, useMemo, useState } from "react";
import { useMoorhenInstance } from "@/InstanceManager";
import { setShownSidePanel, showModal } from "@/store";
import { RootState } from "../../store/MoorhenReduxStore";
import { setMainMenuOpen, setSearchBarActive } from "../../store/globalUISlice";
import { MoorhenIcon } from "../icons";
import { MoorhenClickAwayListener } from "../interface-base/utils/ClickAwayListener";
import { MenuFromItems } from "./MenuFromItems";
import { MoorhenSearchBar } from "./SearchBar";
import "./main-menu.css";
import { useMenuHook } from "./menuHook";

export const MoorhenMainMenu = memo(() => {
    const isOpen = useSelector((state: RootState) => state.globalUI.isMainMenuOpen);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const isDevMode = useSelector((state: RootState) => state.generalStates.devMode);
    const dispatch = useDispatch();
    const moorhenInstance = useMoorhenInstance();
    const menuSystem = moorhenInstance.menuSystem;

    const menuVersion = useMenuHook();

    const handleClickAway = (event: MouseEvent | TouchEvent) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(".moorhen__toolbar-item")) return;
        setActiveMenu(null);
    };

    const handleBrandClick = () => {
        // Brand button only acts as a collapse toggle in the narrow vertical layout.
        // In the wide horizontal toolbar there's nothing meaningful to collapse, so it's a no-op.
        const isNarrow = typeof window !== "undefined" && window.matchMedia("(max-width: 960px)").matches;
        if (!isNarrow) return;

        if (isOpen) {
            setActiveMenu(null);
        } else {
            dispatch(setSearchBarActive(false));
        }
        dispatch(setMainMenuOpen(!isOpen));
    };

    const main_menu_config = menuSystem.mainMenuMap;

    const toolbarItems = useMemo(() => {
        const handleClick = (label: string) => {
            setActiveMenu(current => (current === label ? null : label));
            dispatch(setSearchBarActive(false));
        };

        return Object.entries(main_menu_config).map(([key, menu]) => {
            if (menu.label === "Dev tools" && !isDevMode) {
                return null;
            }

            const isActive = activeMenu === menu.label;
            const isOpenable = menu.type === "sub-menu" || menu.type === "jsx";

            const onClick = () => {
                if (menu.type === "sub-menu" || menu.type === "jsx") {
                    handleClick(menu.label);
                } else if (menu.type === "modal") {
                    setActiveMenu(null);
                    dispatch(showModal({ key: menu.modal, openDocked: menu.args?.openDocked ?? null }));
                } else if (menu.type === "panel") {
                    setActiveMenu(null);
                    dispatch(setShownSidePanel(menu.panel));
                }
            };

            let dropdown: React.JSX.Element | null = null;
            if (isActive && isOpenable) {
                if (menu.type === "sub-menu") {
                    const menuItems = menuSystem.getItems(menu.menu);
                    dropdown = (
                        <div className="moorhen__toolbar-dropdown">
                            <MenuFromItems menuItemList={menuItems} title={menu.label} />
                        </div>
                    );
                } else if (menu.type === "jsx") {
                    dropdown = <div className="moorhen__toolbar-dropdown">{menu.component}</div>;
                }
            }

            return (
                <div className={`moorhen__toolbar-item${isActive ? " active" : ""}`} key={key}>
                    <button
                        type="button"
                        className={`moorhen__toolbar-button${isActive ? " active" : ""}`}
                        onClick={onClick}
                        aria-haspopup={isOpenable ? "menu" : undefined}
                        aria-expanded={isOpenable ? isActive : undefined}
                    >
                        {"icon" in menu && menu.icon ? (
                            <span className="moorhen__toolbar-icon">
                                <MoorhenIcon moorhenSVG={menu.icon} alt={menu.label} />
                            </span>
                        ) : null}
                        <span className="moorhen__toolbar-label">{menu.label}</span>
                    </button>
                    {dropdown}
                </div>
            );
        });
    }, [activeMenu, isDevMode, menuSystem, menuVersion]);

    return (
        <MoorhenClickAwayListener onClickAway={handleClickAway}>
            <div
                className={`moorhen__toolbar${isOpen ? "" : " moorhen__toolbar--collapsed"}`}
                role="toolbar"
                aria-label="Main menu"
            >
                <button
                    type="button"
                    className="moorhen__toolbar-brand"
                    onClick={handleBrandClick}
                    aria-label="Toggle main menu"
                    aria-expanded={isOpen}
                >
                    <MoorhenIcon moorhenSVG="MoorhenLogo" alt="Moorhen" className="moorhen__toolbar-brand-logo" />
                    <span className="moorhen__toolbar-brand-name">Moorhen</span>
                </button>
                <div className="moorhen__toolbar-right">
                    <MoorhenSearchBar />
                </div>
                <div className="moorhen__toolbar-items">{toolbarItems}</div>
            </div>
        </MoorhenClickAwayListener>
    );
});
MoorhenMainMenu.displayName = "MoorhenMainMenu";
