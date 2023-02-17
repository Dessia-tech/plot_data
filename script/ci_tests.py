
import unittest

scripts = [
    # Framework
    "graph2D.py",
    "histogram.py",
    "multiple_plots.py",
    "parallel_plot.py",
    "primitive_group_container.py",
    "scatter_matrix.py",
    "scatter_plot.py",
]

for script_name in scripts:
    print(f"\n## Executing script '{script_name}'.")
    exec(open(script_name).read())
    print(f"Script '{script_name}' successful.")

# This needs to be executed once all "assert-tests" have been run + once all unittests are defined
if __name__ == "__main__":
    unittest.main(verbosity=3)
