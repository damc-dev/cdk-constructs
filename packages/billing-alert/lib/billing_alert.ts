import * as cdk from '@aws-cdk/core';
import * as cw_actions from '@aws-cdk/aws-cloudwatch-actions';
import * as sns from '@aws-cdk/aws-sns';
import * as subscriptions from '@aws-cdk/aws-sns-subscriptions';

import { Alarm, Metric, ComparisonOperator } from '@aws-cdk/aws-cloudwatch';

export interface BillingAlertProps {
    /**
     * The threshold of estimated charges in dollars to alert on
     * @default = 1
     */
    readonly alarmThreshold?: number;

    /**
     * Email addresses to send alerts to
     * @default = []
     */
    readonly emailSubscriptions?: string[];
}

export class BillingAlert extends cdk.Construct {
    /**
     * SNS topic alerts get published to
     */
    public readonly topic: sns.Topic;

    /**
     * Billing alarm
     */
    public readonly alarm: Alarm;

    constructor(scope: cdk.Construct, id: string, props: BillingAlertProps = {}) {
        super(scope, id);

        this.topic = new sns.Topic(this, 'BillingTopic');

        const estimatedCharges = new Metric({
            namespace: 'AWS/Billing',
            metricName: 'EstimatedCharges',
            dimensions: {
                Currency: 'USD'
            }
        });

        this.alarm = new Alarm(this, 'BillingAlarm', {
            alarmDescription: 'Alert when estimated charges exceed threshold',
            metric: estimatedCharges,
            threshold: props.alarmThreshold || 1,
            comparisonOperator: ComparisonOperator.GREATER_THAN_THRESHOLD,
            evaluationPeriods: 1,
            statistic: 'max'
        });

        this.alarm.addAlarmAction(new cw_actions.SnsAction(this.topic));

        if(props.emailSubscriptions !== undefined && props.emailSubscriptions.length > 0) {
            props.emailSubscriptions.forEach((email) => {
                this.topic.addSubscription(new subscriptions.EmailSubscription(email));
            });
        }
    }
}