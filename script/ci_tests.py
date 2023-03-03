import os
import sys
import unittest

import plot_data

# Run in terminal: coverage run --source plot_data ci_tests.py --path="../cypress/data_src"

path = "/".join(os.path.dirname(__file__).split("/")[:-1] + ["cypress/data_src"])

enable_cypress = os.path.exists(path)
    
if len(sys.argv) > 1:
    path = sys.argv[1]
    if path.startswith("--path"):
        path = path.replace("--path", "").replace("=", "").replace(" ", "")
        print(path)

scripts = [
    # Framework
    "graph2D.py",
    "histogram.py",
    "multiplot.py",
    "parallel_plot.py",
    "primitive_group_container.py",
    "scatter_matrix.py",
    "plot_scatter.py",
    "primitive_group.py",
    "simple_shapes.py",
    "text_scaling.py"
]

for script_name in scripts:
    print(f"\n## Executing script '{script_name}'.")
    exec(open(script_name).read())
    print(f"Script '{script_name}' successful.")
    if enable_cypress:
        plot_data.write_json_for_tests(plot_data_object,
                                       f"{path}/{script_name[:-3].replace('_', '')}.data.json".lower())


# # This needs to be executed once all "assert-tests" have been run + once all unittests are defined
# if __name__ == "__main__":
#     unittest.main(verbosity=3, argv=[path])
#     print("truc2")
