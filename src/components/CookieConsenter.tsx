import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CookieConsenterProps,
  CookieCategories,
  DetailedCookieConsent,
} from "../types/types";
import { TFunction } from "../utils/translations";
import { ManageConsent } from "./ManageConsent";
import { cn } from "../utils/cn";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // matches Tailwind's sm breakpoint
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

const MobileModal: React.FC<
  Omit<CookieConsenterProps, "translations" | "translationI18NextPrefix"> & {
    tFunction: TFunction;
    handleAccept: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleDecline: (e: React.MouseEvent<HTMLButtonElement>) => void;
    handleManage: (e: React.MouseEvent<HTMLButtonElement>) => void;
    isExiting: boolean;
    isEntering: boolean;
    isManaging: boolean;
    handleSavePreferences: (categories: CookieCategories) => void;
    handleCancelManage: () => void;
    initialPreferences?: CookieCategories;
    detailedConsent?: DetailedCookieConsent | null;
    classNames?: CookieConsenterProps["classNames"];
  }
> = ({
  showManageButton,
  privacyPolicyUrl,
  theme,
  tFunction,
  handleAccept,
  handleDecline,
  handleManage,
  isExiting,
  isEntering,
  isManaging,
  handleSavePreferences,
  handleCancelManage,
  displayType = "banner",
  initialPreferences,
  detailedConsent,
  cookieCategories,
  categories,
  classNames,
}) => {
  const title = tFunction("title");
  const mobileContentOverride =
    displayType === "modal"
      ? classNames?.modalContent
      : displayType === "popup"
      ? classNames?.popupContent
      : classNames?.bannerContent;
  return (
    <div className="cookie-manager" data-cookie-theme={theme ?? "light"}>
      {displayType === "modal" && (
        <div className="rcm-overlay fixed inset-0 z-[99999]" />
      )}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 px-4 pb-4 pt-2 z-[99999]",
          "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          isExiting
            ? "translate-y-full"
            : isEntering
            ? "translate-y-full"
            : "translate-y-0"
        )}
      >
        <div
          className={cn(
            "rcm-surface p-4 mx-auto max-w-[calc(100vw-32px)]",
            mobileContentOverride && cn(mobileContentOverride)
          )}
        >
          {isManaging ? (
            <ManageConsent
              theme={theme}
              tFunction={tFunction}
              onSave={handleSavePreferences}
              onCancel={handleCancelManage}
              initialPreferences={initialPreferences}
              cookieCategories={cookieCategories}
              categories={categories}
              detailedConsent={detailedConsent}
              classNames={classNames}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {title && (
                <h3
                  className={cn(
                    classNames?.bannerTitle || "rcm-title font-semibold my-0"
                  )}
                >
                  {title}
                </h3>
              )}
              <p
                className={cn(
                  classNames?.bannerMessage || "rcm-message text-sm"
                )}
              >
                {tFunction("message")}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleAccept}
                  className={
                    classNames?.acceptButton
                      ? cn(classNames.acceptButton)
                      : cn(
                          "rcm-button-primary w-full px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus:outline-none"
                        )
                  }
                >
                  {tFunction("buttonText")}
                </button>
                <button
                  onClick={handleDecline}
                  className={
                    classNames?.declineButton
                      ? cn(classNames.declineButton)
                      : cn(
                          "rcm-button-secondary w-full px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus:outline-none"
                        )
                  }
                >
                  {tFunction("declineButtonText")}
                </button>
                {showManageButton && (
                  <button
                    onClick={handleManage}
                    className={
                      classNames?.manageButton
                        ? cn(classNames.manageButton)
                        : cn(
                          "rcm-button-outline w-full px-3 py-2.5 text-sm font-medium focus-visible:outline-none focus:outline-none"
                          )
                    }
                  >
                    {tFunction("manageButtonText")}
                  </button>
                )}
              </div>
              {privacyPolicyUrl && (
                <a
                  href={privacyPolicyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    classNames?.privacyPolicyLink
                      ? cn(classNames.privacyPolicyLink)
                      : cn(
                          "rcm-link text-xs text-right"
                        )
                  }
                >
                  {tFunction("privacyPolicyText")}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CookieConsenter: React.FC<
  CookieConsenterProps & { tFunction: TFunction }
> = ({
  showManageButton = true,
  privacyPolicyUrl,
  displayType = "popup",
  theme = "light",
  tFunction,
  onAccept,
  onDecline,
  onManage,
  initialPreferences = {
    Analytics: false,
    Social: false,
    Advertising: false,
  },
  cookieCategories = {
    Analytics: true,
    Social: true,
    Advertising: true,
  },
  categories,
  detailedConsent,
  isManaging = false,
  classNames,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    setTimeout(() => {
      setIsEntering(false);
    }, 50);
  }, []);

  useEffect(() => {
    if (isExiting) {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 500); // Match the duration of the exit animation
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  const handleAcceptClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      if (onAccept) onAccept();
    }, 500);
  };

  const handleDeclineClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsExiting(true);
    setTimeout(() => {
      if (onDecline) onDecline();
    }, 500);
  };

  const handleManageClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onManage) onManage();
  };

  const handleSavePreferences = (categories: CookieCategories) => {
    setIsExiting(true);
    setTimeout(() => {
      if (onManage) {
        onManage(categories);
      }
    }, 500);
  };

  const handleCancelManage = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onManage) onManage();
    }, 500);
  };

  if (!shouldRender) return null;

  // If isManaging is true, don't render the consenter
  if (isManaging) {
    return null;
  }

  // On mobile, always render the MobileModal regardless of displayType
  if (isMobile) {
    if (typeof document === "undefined") return null;
    return createPortal(
      <MobileModal
        {...{
          showManageButton,
          privacyPolicyUrl,
          theme,
          tFunction,
          handleAccept: handleAcceptClick,
          handleDecline: handleDeclineClick,
          handleManage: handleManageClick,
          isExiting,
          isEntering,
          isManaging: false,
          handleSavePreferences,
          handleCancelManage,
          displayType,
          initialPreferences,
          cookieCategories,
          categories,
          detailedConsent,
          classNames,
        }}
      />,
      document.body
    );
  }

  const acceptButtonClasses = classNames?.acceptButton
    ? cn(classNames.acceptButton)
    : cn(
        "rcm-button-primary px-3 py-1.5 text-xs font-medium",
        "transition-all duration-200",
        "hover:scale-105 focus-visible:outline-none focus:outline-none",
        "focus-visible:outline-transparent focus:outline-transparent",
        displayType === "popup" ? "flex-1" : ""
      );

  const declineButtonClasses = classNames?.declineButton
    ? cn(classNames.declineButton)
    : cn(
        "rcm-button-secondary px-3 py-1.5 text-xs font-medium",
        "transition-all duration-200",
        "hover:scale-105 focus-visible:outline-none focus:outline-none",
        "focus-visible:outline-transparent focus:outline-transparent",
        displayType === "popup" ? "flex-1" : ""
      );

  const manageButtonClasses = classNames?.manageButton
    ? cn(classNames.manageButton)
    : cn(
        "rcm-button-outline px-3 py-1.5 text-xs font-medium",
        "transition-all duration-200",
        "hover:scale-105 focus-visible:outline-none focus:outline-none",
        "focus-visible:outline-transparent focus:outline-transparent",
        displayType === "popup" ? "flex-1" : ""
      );

  const privacyLinkClasses = classNames?.privacyPolicyLink
    ? cn(classNames.privacyPolicyLink)
    : cn(
        "rcm-link text-xs font-medium",
        "transition-colors duration-200"
      );

  const modalBaseClasses = classNames?.modalContainer
    ? cn(classNames.modalContainer)
    : cn(
        "rcm-overlay fixed inset-0 flex items-center justify-center p-4",
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "z-[99999]",
        isExiting ? "opacity-0" : isEntering ? "opacity-0" : "opacity-100"
      );

  const modalContentClasses = classNames?.modalContent
    ? cn(classNames.modalContent)
    : cn(
        "rcm-surface w-full max-w-lg p-6",
        isExiting ? "scale-95" : isEntering ? "scale-95" : "scale-100",
        "transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
      );

  const modalTitleClasses = classNames?.modalTitle
    ? cn(classNames.modalTitle)
    : cn(
        "rcm-title text-lg font-semibold mb-3"
      );

  const modalMessageClasses = classNames?.modalMessage
    ? cn(classNames.modalMessage)
    : cn(
        "rcm-message text-sm font-medium mb-6"
      );

  const popupBaseClasses = classNames?.popupContainer
    ? cn(classNames.popupContainer)
    : cn(
        "rcm-surface fixed bottom-4 left-4 w-80",
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "z-[99999] hover:-translate-y-2",
        isExiting
          ? "opacity-0 scale-95"
          : isEntering
          ? "opacity-0 scale-95"
          : "opacity-100 scale-100"
      );

  const bannerBaseClasses = classNames?.bannerContainer
    ? cn(classNames.bannerContainer)
    : cn(
        "rcm-surface fixed bottom-4 left-1/2 -translate-x-1/2 w-full md:max-w-2xl",
        "transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "z-[99999] hover:-translate-y-2",
        isExiting
          ? "opacity-0 transform translate-y-full"
          : isEntering
          ? "opacity-0 transform translate-y-full"
          : "opacity-100 transform translate-y-0"
      );

  const bannerContentClasses = classNames?.bannerContent
    ? cn(classNames.bannerContent)
    : cn(
        "rcm-message flex flex-col gap-4 p-4"
      );

  const popupContentClasses = classNames?.popupContent
    ? cn(classNames.popupContent)
    : cn(
        "rcm-message flex flex-col items-start gap-4 p-4"
      );

  const bannerTitleClasses = classNames?.bannerTitle
    ? cn(classNames.bannerTitle)
    : cn(
        "rcm-title text-sm font-semibold mb-1"
      );

  const popupTitleClasses = classNames?.popupTitle
    ? cn(classNames.popupTitle)
    : cn(
        "rcm-title text-sm font-semibold mb-2"
      );

  const bannerMessageClasses = classNames?.bannerMessage
    ? cn(classNames.bannerMessage)
    : cn(
        "rcm-message text-xs sm:text-sm font-medium text-center sm:text-left"
      );

  const popupMessageClasses = classNames?.popupMessage
    ? cn(classNames.popupMessage)
    : cn(
        "rcm-message text-xs font-medium"
      );

  const getBaseClasses = () => {
    switch (displayType) {
      case "modal":
        return modalBaseClasses;
      case "popup":
        return popupBaseClasses;
      default:
        return bannerBaseClasses;
    }
  };

  const getContentClasses = () => {
    switch (displayType) {
      case "modal":
        return modalContentClasses;
      case "popup":
        return popupContentClasses;
      default:
        return bannerContentClasses;
    }
  };

  const getTitleClasses = () => {
    switch (displayType) {
      case "modal":
        return modalTitleClasses;
      case "popup":
        return popupTitleClasses;
      default:
        return bannerTitleClasses;
    }
  };

  const getMessageClasses = () => {
    switch (displayType) {
      case "modal":
        return modalMessageClasses;
      case "popup":
        return popupMessageClasses;
      default:
        return bannerMessageClasses;
    }
  };

  const renderContent = () => {
    const title = tFunction("title");
    if (displayType === "banner") {
      return (
        <div className="flex flex-col gap-4">
          <div>
            {title && <p className={getTitleClasses()}>{title}</p>}
            <p className={getMessageClasses()}>{tFunction("message")}</p>
          </div>
          <div className="flex items-center justify-between w-full">
            {privacyPolicyUrl && (
              <a
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={privacyLinkClasses}
              >
                {tFunction("privacyPolicyText")}
              </a>
            )}
            <div className="flex items-center gap-3 ml-auto">
              {showManageButton && (
                <button
                  onClick={handleManageClick}
                  className={manageButtonClasses}
                >
                  {tFunction("manageButtonText")}
                </button>
              )}
              <button
                onClick={handleDeclineClick}
                className={declineButtonClasses}
              >
                {tFunction("declineButtonText")}
              </button>
              <button
                onClick={handleAcceptClick}
                className={acceptButtonClasses}
              >
                {tFunction("buttonText")}
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col">
        {title && <p className={getTitleClasses()}>{title}</p>}
        <p className={getMessageClasses()}>{tFunction("message")}</p>
      </div>
    );
  };

  const renderButtons = () => {
    if (displayType === "popup") {
      return (
        <div className="flex flex-col gap-3 w-full">
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleDeclineClick}
              className={declineButtonClasses}
            >
              {tFunction("declineButtonText")}
            </button>
            <button onClick={handleAcceptClick} className={acceptButtonClasses}>
              {tFunction("buttonText")}
            </button>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {showManageButton && (
              <button
                onClick={handleManageClick}
                className={`${manageButtonClasses} w-full justify-center`}
              >
                {tFunction("manageButtonText")}
              </button>
            )}
            {privacyPolicyUrl && (
              <a
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${privacyLinkClasses.trim()} text-right`}
              >
                {tFunction("privacyPolicyText")}
              </a>
            )}
          </div>
        </div>
      );
    }

    if (displayType === "modal") {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-end">
            {privacyPolicyUrl && (
              <a
                href={privacyPolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${privacyLinkClasses.trim()} mr-auto`}
              >
                {tFunction("privacyPolicyText")}
              </a>
            )}
            <div className="flex items-center gap-3">
              {showManageButton && (
                <button
                  onClick={handleManageClick}
                  className={manageButtonClasses}
                >
                  {tFunction("manageButtonText")}
                </button>
              )}
              <button
                onClick={handleDeclineClick}
                className={declineButtonClasses}
              >
                {tFunction("declineButtonText")}
              </button>
              <button
                onClick={handleAcceptClick}
                className={acceptButtonClasses}
              >
                {tFunction("buttonText")}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const content = (
    <div className="cookie-manager" data-cookie-theme={theme}>
      <div className={getBaseClasses()}>
        {displayType === "modal" ? (
          <div className={getContentClasses()}>
            {renderContent()}
            {renderButtons()}
          </div>
        ) : (
          <div className={getContentClasses()}>
            {renderContent()}
            {renderButtons()}
          </div>
        )}
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
};

export default CookieConsenter;
