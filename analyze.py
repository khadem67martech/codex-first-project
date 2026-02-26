# Import the csv module so we can read data from a CSV file.
import csv

# Create an empty dictionary to store ROAS by channel.
# The key will be the channel name and the value will be its ROAS.
roas_by_channel = {}

# Open the data.csv file in read mode.
# newline="" is a common best practice when reading CSV files in Python.
with open("data.csv", "r", newline="") as file:
    # Create a DictReader so each row is read like a dictionary
    # using the column names from the CSV header.
    reader = csv.DictReader(file)

    # Go through each row in the CSV file one by one.
    for row in reader:
        # Get the channel name from the current row.
        channel = row["channel"]

        # Convert revenue from text to a number so we can do math.
        revenue = float(row["revenue"])

        # Convert cost from text to a number so we can do math.
        cost = float(row["cost"])

        # Calculate ROAS (Return on Ad Spend) as revenue divided by cost.
        # If cost is 0, set ROAS to 0 to avoid division by zero errors.
        if cost == 0:
            roas = 0
        else:
            roas = revenue / cost

        # Save the calculated ROAS for this channel in the dictionary.
        roas_by_channel[channel] = roas

# Print a title line so the output is easy to understand.
print("ROAS by channel:")

# Print each channel and its ROAS value.
# :.2f formats the number to 2 decimal places.
for channel, roas in roas_by_channel.items():
    print(f"- {channel}: {roas:.2f}")

# Find the channel with the highest ROAS.
# max(..., key=...) returns the key with the largest value.
best_channel = max(roas_by_channel, key=roas_by_channel.get)

# Find the channel with the lowest ROAS.
# min(..., key=...) returns the key with the smallest value.
worst_channel = min(roas_by_channel, key=roas_by_channel.get)

# Print the best channel and its ROAS.
print(f"Best channel: {best_channel} ({roas_by_channel[best_channel]:.2f})")

# Print the worst channel and its ROAS.
print(f"Worst channel: {worst_channel} ({roas_by_channel[worst_channel]:.2f})")
