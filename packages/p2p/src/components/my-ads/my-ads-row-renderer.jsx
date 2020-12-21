import React from 'react';
import PropTypes from 'prop-types';
import { HorizontalSwipe, Icon, ProgressIndicator, Table, Text } from '@deriv/components';
import { isMobile } from '@deriv/shared';
import { observer } from 'mobx-react-lite';
import { Localize, localize } from 'Components/i18next';
import { buy_sell } from 'Constants/buy-sell';
import { useStores } from 'Stores';

const MyAdsRowRenderer = observer(({ row: advert }) => {
    const { my_ads_store } = useStores();
    const {
        account_currency,
        amount,
        amount_display,
        id,
        local_currency,
        max_order_amount_display,
        min_order_amount_display,
        price_display,
        remaining_amount,
        remaining_amount_display,
        type,
    } = advert;

    if (isMobile()) {
        return (
            <HorizontalSwipe
                is_left_swipe
                right_hidden_component={
                    <div className='p2p-my-ads__table-delete'>
                        <Icon
                            icon='IcDelete'
                            custom_color='var(--general-main-1)'
                            size={16}
                            onClick={() => my_ads_store.onClickDelete(advert.id)}
                        />
                    </div>
                }
                visible_component={
                    <Table.Row className='p2p-my-ads__table p2p-my-ads__table-row'>
                        <div className='p2p-my-ads__table-row-details'>
                            <Text color='less-prominent' line_height='m' size='xxs'>
                                <Localize i18n_default_text='Ad ID {{advert_id}} ' values={{ advert_id: advert.id }} />
                            </Text>
                            <Text color='less-prominent' line_height='m' size='xxs'>
                                <Localize
                                    i18n_default_text='Rate (1 {{account_currency}})'
                                    values={{ account_currency }}
                                />
                            </Text>
                        </div>
                        <div className='p2p-my-ads__table-row-details'>
                            <Text line_height='m' size='s' weight='bold'>
                                {type[advert.type]} {account_currency}
                            </Text>
                            <Text color='profit-success' line_height='m' size='s' weight='bold'>
                                {price_display} {local_currency}
                            </Text>
                        </div>
                        <ProgressIndicator
                            className={'p2p-my-ads__table-available-progress'}
                            value={remaining_amount}
                            total={amount}
                        />
                        <div className='p2p-my-ads__table-row-details'>
                            <Text color='profit-success' line_height='m' size='xxs'>
                                {remaining_amount_display} {account_currency}&nbsp;
                                {type === buy_sell.BUY ? localize('Bought') : localize('Sold')}
                            </Text>
                            <Text color='less-prominent' line_height='m' size='xxs'>
                                {amount_display} {account_currency}
                            </Text>
                        </div>
                        <Text color='prominent' line_height='m' size='xxs'>
                            <Localize
                                i18n_default_text='Limits {{min_order_amount}}-{{max_order_amount}} {{account_currency}}'
                                values={{
                                    min_order_amount: min_order_amount_display,
                                    max_order_amount: max_order_amount_display,
                                    account_currency,
                                }}
                            />
                        </Text>
                    </Table.Row>
                }
            />
        );
    }

    return (
        <Table.Row className='p2p-my-ads__table-row'>
            <Table.Cell>
                {type === buy_sell.BUY ? (
                    <Localize i18n_default_text='Buy {{ id }}' values={{ id }} />
                ) : (
                    <Localize i18n_default_text='Sell {{ id }}' values={{ id }} />
                )}
            </Table.Cell>
            <Table.Cell>
                {min_order_amount_display}-{max_order_amount_display} {account_currency}
            </Table.Cell>
            <Table.Cell className='p2p-my-ads__table-price'>
                {price_display} {local_currency}
            </Table.Cell>
            <Table.Cell className='p2p-my-ads__table-available'>
                <ProgressIndicator
                    className={'p2p-my-ads__table-available-progress'}
                    value={remaining_amount}
                    total={amount}
                />
                <div className='p2p-my-ads__table-available-value'>
                    {remaining_amount_display}/{amount_display} {account_currency}
                </div>
            </Table.Cell>
            <Table.Cell className='p2p-my-ads__table-delete'>
                <Icon icon='IcDelete' size={16} onClick={() => my_ads_store.onClickDelete(id)} />
            </Table.Cell>
        </Table.Row>
    );
});

MyAdsRowRenderer.displayName = 'MyAdsRowRenderer';
MyAdsRowRenderer.propTypes = {
    advert: PropTypes.object,
};

export default MyAdsRowRenderer;
