#!/bin/bash
export NODE_ENV=production
yarn run migrations
yarn run start_pm2
yarn run pm2_logs
