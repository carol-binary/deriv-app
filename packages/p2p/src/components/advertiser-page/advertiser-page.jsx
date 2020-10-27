import React from 'react';
import { Button, Icon, Loading, Modal, Popover, Table, Tabs, ThemedScrollbars } from '@deriv/components';
import { observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { generateHexColourFromNickname } from 'Utils/string';
import { InfiniteLoaderList } from 'Components/table/infinite-loader-list.jsx';
import { useStores } from 'Stores';
import Empty from 'Components/empty/empty.jsx';
import NicknameForm from '../nickname/nickname-form.jsx';
import { buy_sell } from '../../constants/buy-sell';
import BuySellForm from '../buy-sell/buy-sell-form.jsx';
import FormError from '../form/error.jsx';
import { localize, Localize } from '../i18next';
import './advertiser-page.scss';

const RowComponent = React.memo(({ data: advert, showAdPopup, style }) => {
    const { advertiser_page_store, general_store } = useStores();
    const { currency } = general_store.client;
    const { is_mobile } = general_store.props;

    const { local_currency, max_order_amount_limit_display, min_order_amount_limit_display, price_display } = advert;

    const is_buy_advert = advertiser_page_store.counterparty_type === buy_sell.BUY;
    const is_my_advert = advertiser_page_store.advertiser_details_id === general_store.advertiser_id;

    return (
        <div style={style}>
            <Table.Row
                className={classNames('advertiser-page__adverts-table_row', {
                    'advertiser-page__adverts-table_row--mobile': is_mobile,
                })}
            >
                {is_mobile ? (
                    <React.Fragment>
                        <Table.Cell className='advertiser-page__cell--mobile'>
                            <div className='advertiser-page__cell-rate'>
                                <Localize
                                    i18n_default_text='Rate (1 {{currency}})'
                                    values={{
                                        currency,
                                    }}
                                />
                            </div>
                            <div className='advertiser-page__adverts-price--mobile'>
                                {price_display} {local_currency}
                            </div>
                            <div className='advertiser-page__cell-limit'>
                                <Localize
                                    i18n_default_text='Limit {{min_order_amount_limit_display}}-{{max_order_amount_limit_display}} {{currency}}'
                                    values={{
                                        min_order_amount_limit_display,
                                        max_order_amount_limit_display,
                                        currency,
                                    }}
                                />
                            </div>
                        </Table.Cell>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Table.Cell>
                            {`${min_order_amount_limit_display}-${max_order_amount_limit_display} ${currency}`}
                        </Table.Cell>
                        <Table.Cell className='advertiser-page__adverts-price'>
                            {price_display} {local_currency}
                        </Table.Cell>
                    </React.Fragment>
                )}
                {is_my_advert ? (
                    <Table.Cell />
                ) : (
                    <Table.Cell
                        className={classNames('advertiser-page__adverts-button', {
                            'advertiser-page__adverts-button--mobile': is_mobile,
                        })}
                    >
                        <Button primary small onClick={() => showAdPopup(advert)}>
                            {is_buy_advert ? localize('Buy') : localize('Sell')} {currency}
                        </Button>
                    </Table.Cell>
                )}
            </Table.Row>
        </div>
    );
});

RowComponent.displayName = 'RowComponent';

const AdvertiserPage = observer(props => {
    const { advertiser_page_store, general_store } = useStores();
    const { is_mobile } = general_store.props;

    advertiser_page_store.setAdvertiserPageProps(props);

    const {
        basic_verification,
        buy_completion_rate,
        buy_orders_count,
        full_verification,
        release_time_avg,
        sell_orders_count,
        total_completion_rate,
        total_orders_count,
    } = advertiser_page_store.advertiser_info;

    const avg_release_time_in_minutes = release_time_avg > 60 ? Math.round(release_time_avg / 60) : '< 1';
    const Form = general_store.nickname ? BuySellForm : NicknameForm;

    const Row = row_props => <RowComponent {...row_props} showAdPopup={advertiser_page_store.showAdPopup} />;

    React.useEffect(() => {
        advertiser_page_store.onMount();
    }, []);

    React.useEffect(() => {
        advertiser_page_store.onTabChange();
    }, [advertiser_page_store.active_index]);

    if (advertiser_page_store.is_loading) {
        return <Loading is_fullscreen={false} />;
    }

    if (advertiser_page_store.error_message) {
        return <div className='advertiser-page__error'>{advertiser_page_store.error_message}</div>;
    }

    return (
        <div className='advertiser-page'>
            <div className='advertiser-page__container'>
                {advertiser_page_store.show_ad_popup && (
                    <Modal
                        className='buy-sell__popup'
                        height={advertiser_page_store.counterparty_type === buy_sell.BUY ? '400px' : '649px'}
                        width='456px'
                        is_open={advertiser_page_store.show_ad_popup}
                        title={advertiser_page_store.modal_title}
                        toggleModal={advertiser_page_store.onCancelClick}
                    >
                        {/* Parent height - Modal.Header height - Modal.Footer height */}
                        <ThemedScrollbars height='calc(100% - 5.8rem - 7.4rem)'>
                            <Modal.Body>
                                <Form
                                    advert={advertiser_page_store.ad}
                                    handleClose={advertiser_page_store.onCancelClick}
                                    handleConfirm={advertiser_page_store.onConfirmClick}
                                    setIsSubmitDisabled={advertiser_page_store.setIsSubmitDisabled}
                                    setErrorMessage={advertiser_page_store.setFormErrorMessage}
                                    setSubmitForm={advertiser_page_store.setSubmitForm}
                                />
                            </Modal.Body>
                        </ThemedScrollbars>
                        <Modal.Footer has_separator>
                            <FormError message={advertiser_page_store.form_error_message} />
                            <Button.Group>
                                <Button secondary type='button' onClick={advertiser_page_store.onCancelClick} large>
                                    {localize('Cancel')}
                                </Button>
                                <Button
                                    is_disabled={advertiser_page_store.is_submit_disabled}
                                    primary
                                    large
                                    onClick={advertiser_page_store.submitForm}
                                >
                                    {localize('Confirm')}
                                </Button>
                            </Button.Group>
                        </Modal.Footer>
                    </Modal>
                )}
                <div className='advertiser-page__header'>
                    <div
                        className={classNames('advertiser-page__header-details', {
                            'advertiser-page__header-details--mobile': is_mobile,
                        })}
                    >
                        <div
                            className='advertiser-page__header-avatar'
                            style={{
                                backgroundColor: generateHexColourFromNickname(
                                    advertiser_page_store.advertiser_details_name
                                ),
                            }}
                        >
                            {advertiser_page_store.short_name}
                        </div>
                        <div className='advertiser-page__header-name'>
                            {advertiser_page_store.advertiser_details_name}
                        </div>
                    </div>
                    <div
                        className={classNames('advertiser-page__header-verification', {
                            'advertiser-page__header-verification--mobile': is_mobile,
                        })}
                    >
                        {basic_verification ? (
                            <div
                                className={classNames('', {
                                    'advertiser-page__header-verification-id': is_mobile,
                                })}
                            >
                                {localize('ID verified')}
                                <Icon
                                    className='advertiser-page__header-verification-icon'
                                    icon='IcCashierVerificationBadge'
                                    size={is_mobile ? 12 : 16}
                                />
                            </div>
                        ) : null}
                        {full_verification ? (
                            <div className='advertiser-page__header-verification-status'>
                                {localize('Address verified')}
                                <Icon
                                    className='advertiser-page__header-verification-icon'
                                    icon='IcCashierVerificationBadge'
                                    size={is_mobile ? 12 : 16}
                                />
                            </div>
                        ) : null}
                    </div>
                </div>
                <div className='advertiser-page__stats--wrapper'>
                    <Table>
                        <ThemedScrollbars
                            className='advertiser-page__horizontal-scroll'
                            is_bypassed={!is_mobile}
                            is_only_horizontal
                            width='calc(100vw - 32px)'
                        >
                            <Table.Row
                                className={classNames('advertiser-page__stats', {
                                    'advertiser-page__stats--mobile': is_mobile,
                                })}
                            >
                                <Table.Cell className='advertiser-page__stats-cell'>
                                    <div className='advertiser-page__stats-cell-header'>{localize('Total orders')}</div>
                                    <div className='advertiser-page__stats-cell-info'>{total_orders_count || '-'}</div>
                                </Table.Cell>
                                <div className='advertiser-page__stats-cell-separator' />
                                {is_mobile ? (
                                    <Table.Cell className='advertiser-page__stats-cell'>
                                        <div className='advertiser-page__stats-cell-header'>{localize('Buy/Sell')}</div>
                                        <div className='advertiser-page__stats-cell-info'>{`${
                                            buy_orders_count || '-'
                                        }/${sell_orders_count || '-'}`}</div>
                                    </Table.Cell>
                                ) : (
                                    <React.Fragment>
                                        <Table.Cell className='advertiser-page__stats-cell'>
                                            <div className='advertiser-page__stats-cell-header'>{localize('Buy')}</div>
                                            <div className='advertiser-page__stats-cell-info'>
                                                {buy_orders_count || '-'}
                                            </div>
                                        </Table.Cell>
                                        <div className='advertiser-page__stats-cell-separator' />
                                        <Table.Cell className='advertiser-page__stats-cell'>
                                            <div className='advertiser-page__stats-cell-header'>{localize('Sell')}</div>
                                            <div className='advertiser-page__stats-cell-info'>
                                                {sell_orders_count || '-'}
                                            </div>
                                        </Table.Cell>
                                    </React.Fragment>
                                )}
                                <div className='advertiser-page__stats-cell-separator' />
                                <Table.Cell className='advertiser-page__stats-cell'>
                                    <div className='advertiser-page__stats-cell-header'>{localize('Completion')}</div>
                                    <div className='advertiser-page__stats-cell-completion'>
                                        <div className='advertiser-page__stats-cell-info'>
                                            {total_completion_rate ? `${total_completion_rate}%` : '-'}
                                        </div>
                                        <div className='advertiser-page__stats-cell-info_buy'>
                                            {localize('(Buy {{- buy_completion_rate }})', {
                                                buy_completion_rate: buy_completion_rate
                                                    ? `${buy_completion_rate}%`
                                                    : localize('N/A'),
                                            })}
                                        </div>
                                    </div>
                                </Table.Cell>
                                <div className='advertiser-page__stats-cell-separator' />
                                <Table.Cell className='advertiser-page__stats-cell'>
                                    <div className='advertiser-page__stats-cell-header'>
                                        {localize('Avg. release time')}
                                    </div>
                                    <div className='advertiser-page__stats-cell-info'>
                                        {release_time_avg
                                            ? localize('{{- avg_release_time_in_minutes}} min', {
                                                  avg_release_time_in_minutes,
                                              })
                                            : '-'}
                                    </div>
                                </Table.Cell>
                            </Table.Row>
                        </ThemedScrollbars>
                    </Table>

                    <Popover
                        className={classNames('advertiser-page__popover-icon', {
                            'advertiser-page__popover-icon--mobile': is_mobile,
                        })}
                        alignment='top'
                        message={localize(
                            "These fields are based on the last 30 days' activity: Buy, Sell, Completion, and Avg. release time."
                        )}
                        zIndex={2}
                    >
                        <Icon icon='IcInfoOutline' size={16} />
                    </Popover>
                </div>
                <div className='advertiser-page__adverts'>
                    <Tabs
                        onTabItemClick={advertiser_page_store.handleTabItemClick}
                        active_index={advertiser_page_store.active_index}
                        className={classNames('advertiser-page__adverts-tabs', {
                            'advertiser-page__adverts-tabs--mobile': is_mobile,
                        })}
                        top
                        header_fit_content
                    >
                        <div label={localize('Buy')} />
                        <div label={localize('Sell')} />
                    </Tabs>
                    <div className='advertiser-page__adverts-table'>
                        {advertiser_page_store.adverts.length ? (
                            <Table>
                                {!is_mobile && (
                                    <Table.Header>
                                        <Table.Row className='advertiser-page__adverts-table_row'>
                                            <Table.Head>{localize('Limits')}</Table.Head>
                                            <Table.Head>
                                                {localize('Rate (1 {{currency}})', {
                                                    currency: general_store.client.currency,
                                                })}
                                            </Table.Head>
                                            <Table.Head>{''}</Table.Head>
                                        </Table.Row>
                                    </Table.Header>
                                )}
                                <ThemedScrollbars className='advertiser-page__adverts-scrollbar'>
                                    <Table.Body>
                                        <InfiniteLoaderList
                                            autosizer_height={`calc(${advertiser_page_store.height_values.join(
                                                ' - '
                                            )})`}
                                            items={advertiser_page_store.adverts}
                                            item_size={is_mobile ? 98 : 56}
                                            RenderComponent={Row}
                                        />
                                    </Table.Body>
                                </ThemedScrollbars>
                            </Table>
                        ) : (
                            <Empty icon='IcCashierNoAds' title={localize('No ads')} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
});
AdvertiserPage.propTypes = {
    navigate: PropTypes.func,
    selected_advert: PropTypes.object,
    showVerification: PropTypes.func,
};
export default AdvertiserPage;
