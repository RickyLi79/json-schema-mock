export function LogDelay() {
    return (target: any, name: string, descriptor: PropertyDescriptor) => {
        const oldValue: Function = descriptor.value;
        descriptor.value = async (...args: any[]) => {
            const start = Date.now();
            oldValue.call(target, ...args);
            console.log(Date.now() - start);
        }
    }
}