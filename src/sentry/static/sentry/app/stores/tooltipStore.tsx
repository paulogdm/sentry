type TooltipStoreInterface = {
  addTooltip: (tooltip: React.Component) => void;
  removeTooltip: (tooltip: React.Component) => void;
  openAllTooltips: () => boolean;
  closeAllTooltips: () => void;
  tooltips: React.Component[];
  getOpenableSingleTooltips: () => React.Component[];
  init: () => TooltipStoreInterface;
};

const MAX_TOOLTIPS_TO_OPEN = 100;

const TooltipStore: TooltipStoreInterface = {
  tooltips: [],

  getOpenableSingleTooltips() {
    return this.tooltips.filter(tooltip => {
      return (
        !(tooltip.props as any).disabled && !(tooltip as any)._reactInternalFiber.key
      );
    });
  },

  /**
   * Called via window.__openAllTooltips in selenium tests to check tooltip snapshots
   */
  openAllTooltips() {
    const tooltips = this.getOpenableSingleTooltips();
    if (!tooltips.length || tooltips.length > MAX_TOOLTIPS_TO_OPEN) {
      // Pages with too many tooltip components will take too long to render and it isn't likely helpful anyway.
      return false;
    }
    tooltips.forEach(tooltip => {
      tooltip.setState({
        isOpen: true,
        usesGlobalPortal: false,
      });
    });
    return true;
  },

  /**
   * Called via window.__closeAllTooltips in selenium tests to cleanup tooltips after taking a snapshot
   */
  closeAllTooltips() {
    const tooltips = this.getOpenableSingleTooltips();
    tooltips.forEach(tooltip => {
      tooltip.setState({
        isOpen: false,
        usesGlobalPortal: true,
      });
    });
  },

  init(): TooltipStoreInterface {
    window.__openAllTooltips = this.openAllTooltips.bind(this);
    window.__closeAllTooltips = this.closeAllTooltips.bind(this);
    return this;
  },

  addTooltip(tooltip: React.Component) {
    this.tooltips.push(tooltip);
  },

  removeTooltip(tooltip: React.Component) {
    this.tooltips = this.tooltips.filter(t => t !== tooltip);
  },
};

export default TooltipStore.init();
