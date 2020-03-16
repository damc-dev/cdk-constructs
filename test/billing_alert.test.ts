import { expect as expectCDK, haveResource, countResources } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { BillingAlert } from '../lib/billing_alert';

test('BillingAlert created with no email subscriptions', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new BillingAlert(stack, 'MyBillingAlert');

  expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  expectCDK(stack).to(haveResource("AWS::CloudWatch::Alarm"));

  expectCDK(stack).to(countResources("AWS::SNS::Subscription", 0));
});

test('BillingAlert created with email subscriptions', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new BillingAlert(stack, 'MyBillingAlert', {
    emailSubscriptions: [
      'test1@example.com',
      'test2@example.com'
    ]
  });

  expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  expectCDK(stack).to(haveResource("AWS::CloudWatch::Alarm", {
    Threshold: 1
  }));
  expectCDK(stack).to(haveResource("AWS::SNS::Subscription", {
    Protocol: "email",
    Endpoint: "test1@example.com"
  }));
  expectCDK(stack).to(haveResource("AWS::SNS::Subscription", {
    Protocol: "email",
    Endpoint: "test2@example.com"
  }));
});

test('BillingAlert created with threshold', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new BillingAlert(stack, 'MyBillingAlert', {
    alarmThreshold: 5
  });

  expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  expectCDK(stack).to(haveResource("AWS::CloudWatch::Alarm", {
    Threshold: 5
  }));
});

test('BillingAlert created with subscriptions and threshold', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack");

  new BillingAlert(stack, 'MyBillingAlert', {
    alarmThreshold: 5,
    emailSubscriptions: [
      'test@example.com'
    ]
  });

  expectCDK(stack).to(haveResource("AWS::SNS::Topic"));
  expectCDK(stack).to(haveResource("AWS::CloudWatch::Alarm", {
    Threshold: 5
  }));
  expectCDK(stack).to(haveResource("AWS::SNS::Subscription", {
    Protocol: "email",
    Endpoint: "test@example.com"
  }));
});