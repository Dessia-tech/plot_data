""" Plot data package init. """

import pkg_resources
from .core import *

__version__ = pkg_resources.require("plot_data")[0].version
