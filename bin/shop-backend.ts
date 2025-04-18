#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ShopBackendStack } from '../lib/shop-backend-stack';

const app = new cdk.App();

new ShopBackendStack(app, 'ShopBackendStack');