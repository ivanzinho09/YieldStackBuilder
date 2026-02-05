import './IsometricStack.css';

interface StackPlane {
    id: string;
    label: string;
    value: string;
    zIndex: number;
    showDimensionLine?: boolean;
    showBottomPattern?: boolean;
}

const stackPlanes: StackPlane[] = [
    { id: '03', label: '03. YIELD OPTIMIZER', value: 'APY +12%', zIndex: 3, showDimensionLine: true },
    { id: '02', label: '02. LENDING PROTOCOL', value: 'AAVE V3', zIndex: 2 },
    { id: '01', label: '01. BASE ASSET', value: 'USDC', zIndex: 1, showBottomPattern: true },
];

export function IsometricStack() {
    return (
        <div className="iso-stack-container">
            <div className="stack-guide-line"></div>

            {stackPlanes.map((plane, index) => (
                <div
                    key={plane.id}
                    className="iso-plane"
                    style={{
                        transform: `rotateX(60deg) rotateZ(-45deg) translateZ(${(2 - index) * 60}px)`,
                        zIndex: plane.zIndex
                    }}
                >
                    <span className="plane-label">{plane.label}</span>
                    <span className="plane-value">{plane.value}</span>
                    {plane.showDimensionLine && (
                        <div className="plane-dimension-line"></div>
                    )}
                    {plane.showBottomPattern && (
                        <div className="plane-bottom-pattern"></div>
                    )}
                </div>
            ))}

            <div className="dimension-line">
                <span className="dim-text">COMPOSITE YIELD</span>
            </div>
        </div>
    );
}
