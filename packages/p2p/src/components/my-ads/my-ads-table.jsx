import classNames from 'classnames';
import React from 'react';
import PropTypes from 'prop-types';
import {
    Button,
    Div100vhContainer,
    HorizontalSwipe,
    Icon,
    Loading,
    ProgressIndicator,
    Table,
    Text,
} from '@deriv/components';
import { isDesktop, isMobile } from '@deriv/shared';
import { observer } from 'mobx-react-lite';
import { localize, Localize } from 'Components/i18next';
import Empty from 'Components/empty/empty.jsx';
import ToggleAds from 'Components/my-ads/toggle-ads.jsx';
import { InfiniteLoaderList } from 'Components/table/infinite-loader-list.jsx';
import { TableError } from 'Components/table/table-error.jsx';
import { useStores } from 'Stores';
import { MyAdsLoader } from './my-ads-loader.jsx';
import MyAdsDeleteModal from './my-ads-delete-modal.jsx';
import { buy_sell } from '../../constants/buy-sell';

const getHeaders = offered_currency => [
    { text: localize('Ad ID') },
    { text: localize('Limits') },
    { text: localize('Rate (1 {{ offered_currency }})', { offered_currency }) },
    { text: localize('Available amount') },
    { text: '' }, // empty header for delete icon
];

const type = {
    buy: <Localize i18n_default_text='Buy' />,
    sell: <Localize i18n_default_text='Sell' />,
};

const RowComponent = observer(({ data: advert, style }) => {
    const { my_ads_store } = useStores();
    const {
        account_currency,
        amount,
        amount_display,
        local_currency,
        max_order_amount_display,
        min_order_amount_display,
        price_display,
        remaining_amount,
        remaining_amount_display,
    } = advert;

    const is_buy_advert = advert.type === buy_sell.BUY;

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
                                {is_buy_advert ? localize('Bought') : localize('Sold')}
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
        <div style={style}>
            <Table.Row className='p2p-my-ads__table-row'>
                <Table.Cell>
                    {type[advert.type]} {advert.id}
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
                    <Icon icon='IcDelete' size={16} onClick={() => my_ads_store.onClickDelete(advert.id)} />
                </Table.Cell>
            </Table.Row>
        </div>
    );
});

RowComponent.propTypes = {
    advert: PropTypes.object,
    onClickDelete: PropTypes.func,
    style: PropTypes.object,
};

RowComponent.displayName = 'RowComponent';

const MyAdsTable = () => {
    const { general_store, my_ads_store } = useStores();

    React.useEffect(() => {
        my_ads_store.setIsTableLoading(true);
        my_ads_store.setItemOffset(0);
        my_ads_store.setAdverts([]);
        my_ads_store.loadMoreAds(my_ads_store.item_offset);
    }, []);

    if (my_ads_store.is_table_loading) {
        return <Loading is_fullscreen={false} />;
    }
    if (my_ads_store.api_table_error_message) {
        return <TableError message={my_ads_store.api_table_error_message} />;
    }

    if (my_ads_store.adverts.length) {
        return (
            <React.Fragment>
                <div className='p2p-my-ads__header'>
                    {isDesktop() && (
                        <Button large primary onClick={my_ads_store.onClickCreate}>
                            {localize('Create new ad')}
                        </Button>
                    )}
                    <ToggleAds />
                </div>
                <Table
                    className={classNames('p2p-my-ads__table', {
                        'p2p-my-ads__table--disabled': !general_store.is_listed,
                    })}
                >
                    {isDesktop() && (
                        <Table.Header>
                            <Table.Row className='p2p-my-ads__table-row'>
                                {getHeaders(general_store.client.currency).map(header => (
                                    <Table.Head key={header.text}>{header.text}</Table.Head>
                                ))}
                            </Table.Row>
                        </Table.Header>
                    )}

                    <Table.Body>
                        {isMobile() ? (
                            <Div100vhContainer height_offset='26rem'>
                                <InfiniteLoaderList
                                    autosizer_height={`calc(${my_ads_store.height_values.join(' - ')})`}
                                    items={my_ads_store.adverts.slice()}
                                    item_size={my_ads_store.item_height}
                                    row_actions={{ onClickDelete: my_ads_store.onClickDelete }}
                                    RenderComponent={RowComponent}
                                    RowLoader={MyAdsLoader}
                                    has_more_items_to_load={my_ads_store.has_more_items_to_load}
                                    loadMore={my_ads_store.loadMoreAds}
                                />
                            </Div100vhContainer>
                        ) : (
                            <InfiniteLoaderList
                                autosizer_height={`calc(${my_ads_store.height_values.join(' - ')})`}
                                items={my_ads_store.adverts.slice()}
                                item_size={my_ads_store.item_height}
                                row_actions={{ onClickDelete: my_ads_store.onClickDelete }}
                                RenderComponent={RowComponent}
                                RowLoader={MyAdsLoader}
                                has_more_items_to_load={my_ads_store.has_more_items_to_load}
                                loadMore={my_ads_store.loadMoreAds}
                            />
                        )}
                    </Table.Body>
                </Table>
                {isMobile() && (
                    <div className='p2p-my-ads__delete-container'>
                        <Button className='p2p-my-ads__delete' large primary onClick={my_ads_store.onClickCreate}>
                            {localize('Create new ad')}
                        </Button>
                    </div>
                )}
                <MyAdsDeleteModal />
            </React.Fragment>
        );
    }

    return (
        <Empty icon='IcCashierNoAds' title={localize('You have no ads')}>
            <Button primary large className='p2p-empty__button' onClick={() => my_ads_store.onClickCreate()}>
                {localize('Create new ad')}
            </Button>
        </Empty>
    );
};

MyAdsTable.propTypes = {
    adverts: PropTypes.array,
    api_table_error_message: PropTypes.string,
    client: PropTypes.object,
    has_more_items_to_load: PropTypes.bool,
    height_values: PropTypes.array,
    is_listed: PropTypes.bool,
    is_table_loading: PropTypes.bool,
    item_height: PropTypes.number,
    item_offset: PropTypes.number,
    loadMoreAds: PropTypes.func,
    onClickCancel: PropTypes.func,
    onClickConfirm: PropTypes.func,
    onClickCreate: PropTypes.func,
    onClickDelete: PropTypes.func,
    setIsTableLoading: PropTypes.func,
};

export default observer(MyAdsTable);
