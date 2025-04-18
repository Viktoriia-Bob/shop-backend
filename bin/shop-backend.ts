#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { ProductServiceStack } from '../lib/product-service/product-service-stack';
import { ShopBackendStack } from '../lib/shop-backend-stack';

const app = new cdk.App();

new ShopBackendStack(app, 'ShopBackendStack');