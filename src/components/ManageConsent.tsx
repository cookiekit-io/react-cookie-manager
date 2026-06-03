import React, { useEffect, useState } from "react";
import {
  CookieCategories,
  DetailedCookieConsent,
  CookieConsenterClassNames,
} from "../types/types";
import { TFunction } from "../utils/translations";
import { cn } from "../utils/cn";

interface ManageConsentProps {
  theme?: "light" | "dark";
  tFunction: TFunction;
  onSave: (categories: CookieCategories) => void;
  onCancel?: () => void;
  initialPreferences?: CookieCategories;
  detailedConsent?: DetailedCookieConsent | null;
  cookieCategories?: CookieCategories;
  classNames?: CookieConsenterClassNames;
}

export const ManageConsent: React.FC<ManageConsentProps> = ({
  theme = "light",
  tFunction,
  onSave,
  onCancel,
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
  detailedConsent,
  classNames,
}) => {
  const [consent, setConsent] = useState<CookieCategories>(initialPreferences);

  // Keep local state in sync if initialPreferences prop changes
  useEffect(() => {
    setConsent(initialPreferences);
  }, [initialPreferences]);

  const handleToggle = (category: keyof CookieCategories) => {
    setConsent((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    onSave(consent);
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const renderConsentStatus = (category: keyof CookieCategories) => {
    if (!detailedConsent || !detailedConsent[category]) return null;

    const status = detailedConsent[category];
    return (
      <p
        className={
          classNames?.manageCookieStatusText
            ? cn(classNames.manageCookieStatusText)
            : cn(
                "text-xs mt-1 text-left",
                theme === "light" ? "text-gray-500" : "text-gray-500"
              )
        }
      >
        {tFunction("manageCookiesStatus", {
          status: status.consented
            ? tFunction("manageCookiesStatusConsented")
            : tFunction("manageCookiesStatusDeclined"),
          date: formatDate(status.timestamp),
        })}
      </p>
    );
  };

  return (
    <div
      className={
        classNames?.manageCookieContainer
          ? cn(classNames.manageCookieContainer)
          : "flex flex-col gap-6"
      }
    >
      <div>
        <h3
          className={
            classNames?.manageCookieTitle
              ? cn(classNames.manageCookieTitle)
              : cn(
                  "text-sm font-semibold mb-2",
                  theme === "light" ? "text-gray-900" : "text-white"
                )
          }
        >
          {tFunction("manageTitle")}
        </h3>
        <p
          className={
            classNames?.manageCookieMessage
              ? cn(classNames.manageCookieMessage)
              : cn(
                  "text-xs",
                  theme === "light" ? "text-gray-700" : "text-gray-200"
                )
          }
        >
          {tFunction("manageMessage")}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Essential Cookies - Always enabled */}
        <div
          className={
            classNames?.manageCookieCategory
              ? cn(classNames.manageCookieCategory)
              : "flex items-start justify-between"
          }
        >
          <div>
            <h4
              className={
                classNames?.manageCookieCategoryTitle
                  ? cn(classNames.manageCookieCategoryTitle)
                  : cn(
                      "text-xs font-medium text-left",
                      theme === "light" ? "text-gray-900" : "text-white"
                    )
              }
            >
              {tFunction("manageEssentialTitle")}
            </h4>
            <p
              className={
                classNames?.manageCookieCategorySubtitle
                  ? cn(classNames.manageCookieCategorySubtitle)
                  : cn(
                      "text-xs text-left",
                      theme === "light" ? "text-gray-600" : "text-gray-400"
                    )
              }
            >
              {tFunction("manageEssentialSubtitle")}
            </p>
            <p
              className={
                classNames?.manageCookieStatusText
                  ? cn(classNames.manageCookieStatusText)
                  : cn(
                      "text-xs mt-1 text-left",
                      theme === "light" ? "text-gray-500" : "text-gray-500"
                    )
              }
            >
              {tFunction("manageEssentialStatus")}
            </p>
          </div>
          <div
            className={`px-3 py-1 text-xs text-center font-medium rounded-full ${
              theme === "light"
                ? "bg-gray-200 text-gray-600"
                : "bg-gray-800 text-gray-300"
            }`}
          >
            {tFunction("manageEssentialStatusButtonText")}
          </div>
        </div>

        {/* Analytics Cookies */}
        {cookieCategories.Analytics !== false && (
          <div
            className={
              classNames?.manageCookieCategory
                ? cn(classNames.manageCookieCategory)
                : "flex items-start justify-between"
            }
          >
            <div>
              <h4
                className={
                  classNames?.manageCookieCategoryTitle
                    ? cn(classNames.manageCookieCategoryTitle)
                    : cn(
                        "text-xs font-medium text-left",
                        theme === "light" ? "text-gray-900" : "text-white"
                      )
                }
              >
                {tFunction("manageAnalyticsTitle")}
              </h4>
              <p
                className={
                  classNames?.manageCookieCategorySubtitle
                    ? cn(classNames.manageCookieCategorySubtitle)
                    : cn(
                        "text-xs text-left",
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      )
                }
              >
                {tFunction("manageAnalyticsSubtitle")}
              </p>
              {renderConsentStatus("Analytics")}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consent.Analytics}
                onChange={() => handleToggle("Analytics")}
                className="sr-only peer"
              />
              <div
                className={
                  classNames?.manageCookieToggle
                    ? cn(
                        classNames.manageCookieToggle,
                        consent.Analytics &&
                          classNames.manageCookieToggleChecked
                      )
                    : cn(`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
                ${
                  theme === "light"
                    ? "bg-gray-200 peer-checked:bg-blue-500"
                    : "bg-gray-700 peer-checked:bg-blue-500"
                } 
                peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
                after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all`)
                }
              ></div>
            </label>
          </div>
        )}

        {/* Social Cookies */}
        {cookieCategories.Social !== false && (
          <div
            className={
              classNames?.manageCookieCategory
                ? cn(classNames.manageCookieCategory)
                : "flex items-start justify-between"
            }
          >
            <div>
              <h4
                className={
                  classNames?.manageCookieCategoryTitle
                    ? cn(classNames.manageCookieCategoryTitle)
                    : cn(
                        "text-xs font-medium text-left",
                        theme === "light" ? "text-gray-900" : "text-white"
                      )
                }
              >
                {tFunction("manageSocialTitle")}
              </h4>
              <p
                className={
                  classNames?.manageCookieCategorySubtitle
                    ? cn(classNames.manageCookieCategorySubtitle)
                    : cn(
                        "text-xs text-left",
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      )
                }
              >
                {tFunction("manageSocialSubtitle")}
              </p>
              {renderConsentStatus("Social")}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consent.Social}
                onChange={() => handleToggle("Social")}
                className="sr-only peer"
              />
              <div
                className={
                  classNames?.manageCookieToggle
                    ? cn(
                        classNames.manageCookieToggle,
                        consent.Social && classNames.manageCookieToggleChecked
                      )
                    : cn(`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
                ${
                  theme === "light"
                    ? "bg-gray-200 peer-checked:bg-blue-500"
                    : "bg-gray-700 peer-checked:bg-blue-500"
                } 
                peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
                after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all`)
                }
              ></div>
            </label>
          </div>
        )}

        {/* Advertising Cookies */}
        {cookieCategories.Advertising !== false && (
          <div
            className={
              classNames?.manageCookieCategory
                ? cn(classNames.manageCookieCategory)
                : "flex items-start justify-between"
            }
          >
            <div>
              <h4
                className={
                  classNames?.manageCookieCategoryTitle
                    ? cn(classNames.manageCookieCategoryTitle)
                    : cn(
                        "text-xs font-medium text-left",
                        theme === "light" ? "text-gray-900" : "text-white"
                      )
                }
              >
                {tFunction("manageAdvertTitle")}
              </h4>
              <p
                className={
                  classNames?.manageCookieCategorySubtitle
                    ? cn(classNames.manageCookieCategorySubtitle)
                    : cn(
                        "text-xs text-left",
                        theme === "light" ? "text-gray-600" : "text-gray-400"
                      )
                }
              >
                {tFunction("manageAdvertSubtitle")}
              </p>
              {renderConsentStatus("Advertising")}
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={consent.Advertising}
                onChange={() => handleToggle("Advertising")}
                className="sr-only peer"
              />
              <div
                className={
                  classNames?.manageCookieToggle
                    ? cn(
                        classNames.manageCookieToggle,
                        consent.Advertising &&
                          classNames.manageCookieToggleChecked
                      )
                    : cn(`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
                ${
                  theme === "light"
                    ? "bg-gray-200 peer-checked:bg-blue-500"
                    : "bg-gray-700 peer-checked:bg-blue-500"
                } 
                peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
                after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
                after:transition-all`)
                }
              ></div>
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:justify-end">
        {onCancel && (
          <button
            onClick={onCancel}
            className={
              classNames?.manageCancelButton
                ? cn(classNames.manageCancelButton)
                : cn(
                    `w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 ${
                      theme === "light"
                        ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                        : "bg-gray-800 hover:bg-gray-700 text-gray-300"
                    }`
                  )
            }
          >
            {tFunction("manageCancelButtonText")}
          </button>
        )}
        <button
          onClick={handleSave}
          className={
            classNames?.manageSaveButton
              ? cn(classNames.manageSaveButton)
              : "w-full sm:w-auto px-3 py-2 sm:py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105"
          }
        >
          {tFunction("manageSaveButtonText")}
        </button>
      </div>
    </div>
  );
};
