import React from "react";

const PageHeader = ({ title, subtitle, actions, children }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          {title && (
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          )}
          {subtitle && (
            <p className="text-gray-600 text-sm lg:text-base mt-2">
              {subtitle}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
};

export default PageHeader;
