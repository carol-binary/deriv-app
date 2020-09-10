import React from 'react';
import PropTypes from 'prop-types';
import { Loading, Button } from '@deriv/components';
import { Localize, localize } from 'Components/i18next';
import { TableError } from 'Components/table/table-error.jsx';
import { InfiniteLoaderList } from 'Components/table/infinite-loader-list.jsx';
import { requestWS, getModifiedP2POrderList } from 'Utils/websocket';
import Dp2pContext from 'Components/context/dp2p-context';
import Empty from 'Components/empty/empty.jsx';
import OrderTableHeader from 'Components/orders/order-table/order-table-header.jsx';
import OrderRowComponent from 'Components/orders/order-table/order-table-row.jsx';
import OrderInfo from 'Components/orders/order-info';
import { height_constants } from 'Utils/height_constants';

const OrderTableContent = ({ showDetails, is_active }) => {
    const {
        changeTab,
        is_active_tab,
        list_item_limit,
        order_offset,
        order_table_type,
        orders,
        setOrders,
        setOrderOffset,
    } = React.useContext(Dp2pContext);
    const [is_mounted, setIsMounted] = React.useState(false);
    const [has_more_items_to_load, setHasMoreItemsToLoad] = React.useState(false);
    const [api_error_message, setApiErrorMessage] = React.useState('');
    const [is_loading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsMounted(true);
        return () => setIsMounted(false);
    }, []);

    React.useEffect(() => {
        if (is_mounted) {
            setIsLoading(true);
            loadMoreOrders();
        }
    }, [is_mounted, order_table_type]);

    const loadMoreOrders = () => {
        return new Promise(resolve => {
            requestWS({
                p2p_order_list: 1,
                offset: order_offset,
                limit: list_item_limit,
                active: is_active_tab ? 1 : 0,
            }).then(response => {
                if (is_mounted) {
                    if (!response.error) {
                        const { list } = response.p2p_order_list;
                        setHasMoreItemsToLoad(list.length >= list_item_limit);
                        setOrders(orders.concat(getModifiedP2POrderList(list)));
                        setOrderOffset(order_offset + list.length);
                    } else {
                        setApiErrorMessage(response.error.message);
                    }
                }
                setIsLoading(false);
                resolve();
            });
        });
    };

    if (is_loading) {
        return <Loading is_fullscreen={false} />;
    }
    if (api_error_message) {
        return <TableError message={api_error_message} />;
    }

    const Row = row_props => <OrderRowComponent {...row_props} onOpenDetails={showDetails} is_active={is_active} />;

    if (orders.length) {
        const modified_list = orders
            .map(list => new OrderInfo(list))
            .filter(order => (is_active ? order.is_active : order.is_inactive));
        const item_height = 72;
        const height_values = [
            height_constants.screen,
            height_constants.core_header,
            height_constants.page_overlay_header,
            height_constants.page_overlay_content_padding,
            height_constants.tabs,
            height_constants.filters,
            height_constants.filters_margin,
            height_constants.table_header,
            height_constants.core_footer,
        ];
        if (modified_list.length) {
            return (
                <OrderTableHeader is_active={is_active}>
                    <InfiniteLoaderList
                        autosizer_height={`calc(${height_values.join(' - ')})`}
                        items={modified_list}
                        item_size={item_height}
                        RenderComponent={Row}
                        // RowLoader={OrderRowLoader}
                        has_more_items_to_load={has_more_items_to_load}
                        loadMore={loadMoreOrders}
                    />
                </OrderTableHeader>
            );
        }
    }

    return (
        <Empty has_tabs icon='IcNoOrder' title={localize('You have no orders')}>
            {is_active && (
                <Button primary large className='p2p-empty__button' onClick={() => changeTab(0)}>
                    <Localize i18n_default_text='Buy/Sell' />
                </Button>
            )}
        </Empty>
    );
};

OrderTableContent.propTypes = {
    is_active: PropTypes.bool,
    is_active_tab: PropTypes.bool,
    showDetails: PropTypes.func,
};

export default OrderTableContent;
