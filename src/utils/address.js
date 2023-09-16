const AddressPrefix = 'address:'
export const addressKey = (address) => {
    return AddressPrefix + address
}

export const isAddressKey = (key) => {
    if (key == '') {
        return false
    }
    return key.startsWith(AddressPrefix)
}

export const getAddressFromKey = (key) => {
    if (isAddressKey(key)) {
        return key.substring(AddressPrefix.length)
    }
    return key
}

export const shortAddress = (address) => {
    return address.slice(0, 7) + "..." + address.slice(-5)
}