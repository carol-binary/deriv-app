import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { Button, Icon, Money } from '@deriv/components';
import { getContractPath } from 'App/Components/Routes/helpers';
import { BinaryLink } from 'App/Components/Routes';
import { isCryptocurrency } from '@deriv/shared';
import Shortcode from 'Modules/Reports/Helpers/shortcode';
import { localize } from '@deriv/translations';
import { PositionsCardLoader } from 'App/Components/Elements/ContentLoader';
import { isMultiplierContract } from 'Stores/Modules/Contract/Helpers/multiplier';
import ContractTypeCell from './contract-type-cell.jsx';
import ProgressSliderMobile from './ProgressSliderMobile';
import ResultMobile from './result-mobile.jsx';
import CardHeader from './PositionsDrawerCard/positions-drawer-card-header.jsx';
import CardBody from './PositionsDrawerCard/positions-drawer-card-body.jsx';
import CardFooter from './PositionsDrawerCard/positions-drawer-card-footer.jsx';

const PositionsModalCard = ({
    className,
    contract_info,
    contract_update,
    currency,
    current_tick,
    indicative,
    id,
    is_loading,
    is_sell_requested,
    is_unsupported,
    is_valid_to_sell,
    profit_loss,
    onClickSell,
    onClickRemove,
    onClickCancel,
    result,
    sell_price,
    status,
    togglePositions,
    toggleUnsupportedContractModal,
    type,
}) => {
    const loader_el = (
        <div className='positions-modal-card__content-loader'>
            <PositionsCardLoader speed={2} />
        </div>
    );
    const is_multiplier = isMultiplierContract(contract_info.contract_type);

    const fallback_result = profit_loss < 0 ? 'lost' : 'won';
    const contract_options_el = (
        <React.Fragment>
            <div className={classNames('positions-modal-card__grid', 'positions-modal-card__grid-header')}>
                <div className='positions-modal-card__underlying-name'>
                    <Icon
                        icon={contract_info.underlying ? `IcUnderlying${contract_info.underlying}` : 'IcUnknown'}
                        size={34}
                    />
                    <span className='positions-modal-card__symbol'>{contract_info.display_name}</span>
                </div>
                <div className='positions-modal-card__type'>
                    <ContractTypeCell
                        multiplier={contract_info.multiplier}
                        type={type}
                        is_high_low={Shortcode.isHighLow({ shortcode: contract_info.shortcode })}
                    />
                </div>
                <CSSTransition
                    in={!!is_valid_to_sell}
                    timeout={250}
                    classNames={{
                        enter: 'positions-modal-card__sell-button--enter',
                        enterDone: 'positions-modal-card__sell-button--enter-done',
                        exit: 'positions-modal-card__sell-button--exit',
                    }}
                    unmountOnExit
                >
                    <div className='positions-modal-card__sell-button'>
                        <Button
                            id={`dt_drawer_card_${id}_button`}
                            className={classNames('dc-btn--sell', {
                                'dc-btn--loading': is_sell_requested,
                            })}
                            is_disabled={!is_valid_to_sell || is_sell_requested}
                            text={localize('Sell')}
                            onClick={() => onClickSell(id)}
                            secondary
                        />
                    </div>
                </CSSTransition>
            </div>
            <div className={classNames('positions-modal-card__grid', 'positions-modal-card__grid-body')}>
                <div className={classNames('positions-modal-card__grid-profit-payout')}>
                    <div
                        className={classNames(
                            'positions-modal-card__profit-loss',
                            'positions-modal-card__profit-loss-label'
                        )}
                    >
                        {result ? localize('Profit/Loss:') : localize('Potential profit/loss:')}
                    </div>
                    <div
                        className={classNames(
                            'positions-modal-card__indicative',
                            'positions-modal-card__indicative-label'
                        )}
                    >
                        {!result ? localize('Indicative price:') : localize('Payout:')}
                    </div>
                    <div
                        className={classNames('positions-modal-card__profit-loss', {
                            'positions-modal-card__profit-loss--is-crypto': isCryptocurrency(currency),
                            'positions-modal-card__profit-loss--negative': profit_loss < 0,
                            'positions-modal-card__profit-loss--positive': profit_loss > 0,
                        })}
                    >
                        <Money amount={Math.abs(profit_loss)} currency={currency} />
                        <div
                            className={classNames('positions-modal-card__indicative--movement', {
                                'positions-modal-card__indicative--movement-complete': !!result,
                            })}
                        >
                            {status === 'profit' && <Icon icon='IcProfit' />}
                            {status === 'loss' && <Icon icon='IcLoss' />}
                        </div>
                    </div>
                    <div className='positions-modal-card__indicative'>
                        <Money amount={sell_price || indicative} currency={currency} />
                        <div
                            className={classNames('positions-modal-card__indicative--movement', {
                                'positions-modal-card__indicative--movement-complete': !!result,
                            })}
                        >
                            {status === 'profit' && <Icon icon='IcProfit' />}
                            {status === 'loss' && <Icon icon='IcLoss' />}
                        </div>
                    </div>
                </div>
                <div className={classNames('positions-modal-card__grid-price-payout')}>
                    <div className='positions-modal-card__purchase-price'>
                        <span className='positions-modal-card__purchase-label'>{localize('Purchase price:')}</span>
                        <span className='positions-modal-card__purchase-value'>
                            <Money amount={contract_info.buy_price} currency={currency} />
                        </span>
                    </div>
                    <div className='positions-modal-card__payout-price'>
                        <span className='positions-modal-card__payout-label'>{localize('Potential payout:')}</span>
                        <span className='positions-modal-card__payout-value'>
                            {contract_info.payout ? (
                                <Money amount={contract_info.payout} currency={currency} />
                            ) : (
                                <strong>-i</strong>
                            )}
                        </span>
                    </div>
                </div>

                {result || !!contract_info.is_sold ? (
                    <ResultMobile
                        contract_id={id}
                        is_unsupported={is_unsupported}
                        is_visible={!!contract_info.is_sold}
                        onClickRemove={onClickRemove}
                        onClick={() => toggleUnsupportedContractModal(true)}
                        result={result || fallback_result}
                    />
                ) : (
                    <ProgressSliderMobile
                        className='positions-modal-card__progress'
                        is_loading={is_loading}
                        start_time={contract_info.date_start}
                        expiry_time={contract_info.date_expiry}
                        current_tick={current_tick}
                        ticks_count={contract_info.tick_count}
                    />
                )}
            </div>
        </React.Fragment>
    );

    const contract_multiplier_el = (
        <React.Fragment>
            <CardHeader contract_info={contract_info} has_progress_slider={!is_multiplier} />
            <CardBody
                contract_info={contract_info}
                contract_update={contract_update}
                currency={currency}
                is_multiplier={is_multiplier}
                status={status}
            />
        </React.Fragment>
    );

    const contract_footer_el = is_multiplier ? (
        <CardFooter
            contract_info={contract_info}
            is_multiplier={is_multiplier}
            is_sell_requested={is_sell_requested}
            onClickCancel={onClickCancel}
            onClickSell={onClickSell}
        />
    ) : null;

    const contract_el = is_multiplier ? contract_multiplier_el : contract_options_el;

    return (
        <div id={`dt_drawer_card_${id}`} className={classNames('positions-modal-card__wrapper', className)}>
            {is_unsupported ? (
                <div
                    className={classNames('positions-modal-card')}
                    onClick={() => toggleUnsupportedContractModal(true)}
                >
                    {contract_info.underlying ? contract_el : loader_el}
                </div>
            ) : (
                <React.Fragment>
                    <BinaryLink
                        onClick={togglePositions}
                        className={classNames('positions-modal-card', {
                            'positions-modal-card--multiplier': is_multiplier,
                        })}
                        to={getContractPath(id)}
                    >
                        {contract_info.underlying ? contract_el : loader_el}
                    </BinaryLink>
                    {contract_footer_el}
                </React.Fragment>
            )}
        </div>
    );
};

PositionsModalCard.propTypes = {
    className: PropTypes.string,
    contract_info: PropTypes.object,
    currency: PropTypes.string,
    current_tick: PropTypes.number,
    duration: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    duration_unit: PropTypes.string,
    exit_spot: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    id: PropTypes.number,
    indicative: PropTypes.number,
    is_loading: PropTypes.bool,
    is_sell_requested: PropTypes.bool,
    is_unsupported: PropTypes.bool,
    is_valid_to_sell: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    onClickRemove: PropTypes.func,
    onClickSell: PropTypes.func,
    onClickCancel: PropTypes.func,
    profit_loss: PropTypes.number,
    result: PropTypes.string,
    sell_time: PropTypes.number,
    status: PropTypes.string,
    togglePositions: PropTypes.func,
    toggleUnsupportedContractModal: PropTypes.func,
    type: PropTypes.string,
};

export default PositionsModalCard;
