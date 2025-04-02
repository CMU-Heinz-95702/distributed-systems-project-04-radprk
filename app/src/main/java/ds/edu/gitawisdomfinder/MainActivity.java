package ds.edu.gitawisdomfinder;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

import java.io.StringReader;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Callback;
import okhttp3.Call;
import okhttp3.Response;

import java.io.IOException;

public class MainActivity extends AppCompatActivity {

    private EditText inputQuery;
    private Button submitButton;
    private TextView verseReference;
    private TextView verseText;
    private TextView verseMeaning;
    private TextView verseExplanation;
    private View resultContainer;
    private ProgressBar progressBar;

    private OkHttpClient client = new OkHttpClient();

    // Replace with your actual server address
    // For local testing, use your computer's IP address instead of localhost
    // You can find your IP address by running 'ipconfig' in Command Prompt
    private static final String API_URL = "http://172.24.192.1:3000/api/find-wisdom";
    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            setContentView(R.layout.activity_main);

            // Initialize UI components
            inputQuery = findViewById(R.id.input_query);
            submitButton = findViewById(R.id.submit_button);
            verseReference = findViewById(R.id.verse_reference);
            verseText = findViewById(R.id.verse_text);
            verseMeaning = findViewById(R.id.verse_meaning);
            verseExplanation = findViewById(R.id.verse_explanation);
            resultContainer = findViewById(R.id.result_container);
            progressBar = findViewById(R.id.progress_bar);

            // Initially hide the result container
            resultContainer.setVisibility(View.GONE);

            // Set up button click listener
            submitButton.setOnClickListener(v -> {
                Toast.makeText(this, "Button clicked", Toast.LENGTH_SHORT).show();
                // Comment out the actual query for now
                 findWisdom(inputQuery.getText().toString().trim());
            });
        } catch (Exception e) {
            Toast.makeText(this, "Error: " + e.getMessage(), Toast.LENGTH_LONG).show();
            e.printStackTrace();
        }
    }

    /**
     * Send the user query to the server and process the response
     * @param query The user's question or life situation
     */
    private void findWisdom(String query) {
        // Show progress and hide results
        progressBar.setVisibility(View.VISIBLE);
        resultContainer.setVisibility(View.GONE);

        // Create JSON request body
        String jsonBody = "{\"query\":\"" + query.replace("\"", "\\\"") + "\"}";
        RequestBody body = RequestBody.create(jsonBody, JSON);

        // Build the request
        Request request = new Request.Builder()
                .url(API_URL)
                .post(body)
                .build();

        // Execute the request asynchronously
        client.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                // Handle network failure
                runOnUiThread(() -> {
                    progressBar.setVisibility(View.GONE);
                    Toast.makeText(MainActivity.this,
                            "Network error: " + e.getMessage(),
                            Toast.LENGTH_LONG).show();
                });
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (!response.isSuccessful()) {
                    // Handle HTTP error
                    runOnUiThread(() -> {
                        progressBar.setVisibility(View.GONE);
                        Toast.makeText(MainActivity.this,
                                "Server error: " + response.code(),
                                Toast.LENGTH_LONG).show();
                    });
                    return;
                }

                // Parse JSON response
                try {
                    final String responseData = response.body().string();
                    // Process the response on the UI thread
                    runOnUiThread(() -> {
                        try {
                            // Parse JSON response
                            org.json.JSONObject jsonResponse = new org.json.JSONObject(responseData);

                            // Extract data
                            String chapter = jsonResponse.getString("chapter");
                            String verse = jsonResponse.getString("verse");
                            String text = jsonResponse.getString("text");
                            String meaning = jsonResponse.getString("meaning");
                            String explanation = jsonResponse.getString("explanation");

                            // Update UI
                            progressBar.setVisibility(View.GONE);
                            resultContainer.setVisibility(View.VISIBLE);

                            // Set the text values
                            verseReference.setText("Chapter " + chapter + ", Verse " + verse);
                            verseText.setText(text);
                            verseMeaning.setText(meaning);
                            verseExplanation.setText(explanation);

                        } catch (Exception e) {
                            progressBar.setVisibility(View.GONE);
                            Toast.makeText(MainActivity.this,
                                    "Error parsing response: " + e.getMessage(),
                                    Toast.LENGTH_LONG).show();
                        }
                    });
                } catch (Exception e) {
                    runOnUiThread(() -> {
                        progressBar.setVisibility(View.GONE);
                        Toast.makeText(MainActivity.this,
                                "Error processing response: " + e.getMessage(),
                                Toast.LENGTH_LONG).show();
                    });
                }
            }
        });
    }
}