#!/bin/bash

if [ "$VERCEL_ENV" = "production" ]; then
  export VITE_SITE_MODE=production
elif [ "$VERCEL_ENV" = "preview" ]; then
  export VITE_SITE_MODE=preview
else
  export VITE_SITE_MODE=development
fi

if [ "$VERCEL_PROJECT_NAME" = "listn-rent-admin" ]; then
  npm run build --workspace=@listnrent/admin
else
  npm run build --workspace=@listnrent/client
fi