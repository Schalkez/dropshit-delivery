export function formatNumber(value: any) {
  return (value || '0').toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
}
export function shortenEthAddress(address: string) {
  const start = address.substring(0, 3);
  const end = address.substring(address.length - 3);
  return start + '...' + end;
}
