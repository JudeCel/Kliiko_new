#!/bin/bash
export NODE_ENV=production
npm install --quiet
npm run build_prod
npm run migrations
npm run start_pm2
npm run pm2_logs
