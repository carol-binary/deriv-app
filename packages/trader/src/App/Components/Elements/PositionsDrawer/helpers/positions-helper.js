import moment from 'moment';
import { localize } from '@deriv/translations';
import Shortcode from 'Modules/Reports/Helpers/shortcode';
import { getContractTypesConfig } from 'Stores/Modules/Trading/Constants/contract';
import { isCallPut } from 'Stores/Modules/Contract/Helpers/contract-type';

export const addCommaToNumber = (num, decimal_places) => {
    if (!num || isNaN(num)) {
        return num;
    }
    const n = String(decimal_places ? (+num).toFixed(decimal_places) : num);
    const p = n.indexOf('.');
    return n.replace(/\d(?=(?:\d{3})+(?:\.|$))/g, (m, i) => (p <= 0 || i < p ? `${m},` : m));
};

export const getTimePercentage = (server_time, start_time, expiry_time) => {
    const duration_from_purchase = moment.duration(moment.unix(expiry_time).diff(moment.unix(start_time)));
    const duration_from_now = moment.duration(moment.unix(expiry_time).diff(server_time));
    let percentage = (duration_from_now.asMilliseconds() / duration_from_purchase.asMilliseconds()) * 100;

    if (percentage < 0.5) {
        percentage = 0;
    } else if (percentage > 100) {
        percentage = 100;
    }

    return Math.round(percentage);
};

export const getBarrierLabel = contract_info => {
    if (isDigitType(contract_info.contract_type)) {
        return localize('Target');
    }
    return localize('Barrier');
};

export const getBarrierValue = contract_info => {
    if (isDigitType(contract_info.contract_type)) {
        return digitTypeMap(contract_info)[contract_info.contract_type];
    }
    return addCommaToNumber(contract_info.barrier);
};

export const isDigitType = contract_type => /digit/.test(contract_type.toLowerCase());

const digitTypeMap = contract_info => ({
    DIGITDIFF: localize('Not {{barrier}}', { barrier: contract_info.barrier }),
    DIGITEVEN: localize('Even'),
    DIGITMATCH: localize('Equals {{barrier}}', { barrier: contract_info.barrier }),
    DIGITODD: localize('Odd'),
    DIGITOVER: localize('Over {{barrier}}', { barrier: contract_info.barrier }),
    DIGITUNDER: localize('Under {{barrier}}', { barrier: contract_info.barrier }),
});

export const filterByContractType = ({ contract_type, shortcode }, trade_contract_type) => {
    const is_call_put = isCallPut(trade_contract_type);
    const is_high_low = Shortcode.isHighLow({ shortcode });
    const trade_types = is_call_put
        ? ['CALL', 'CALLE', 'PUT', 'PUTE']
        : getContractTypesConfig()[trade_contract_type]?.trade_types;
    const match = trade_types?.includes(contract_type);
    if (trade_contract_type === 'high_low') return is_high_low;
    return match && !is_high_low;
};
